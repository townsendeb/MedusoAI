"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PLAN_LABELS,
  PLAN_LIMITS,
  type SubscriptionPlan,
  UPGRADEABLE_PLANS,
} from "@meduso/shared";
import type { BillingSummary } from "@/lib/billing/types";
import { usagePercent } from "@/lib/billing/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type BillingManagerProps = {
  summary: BillingSummary;
  checkoutStatus?: string | null;
};

function redirectTo(url: string) {
  globalThis.location.assign(url);
}

const METRIC_LABELS = {
  sms_sent: "SMS sent",
  voice_minutes: "Voice minutes",
  customers_imported: "Customers imported",
} as const;

function formatLimit(limit: number | null): string {
  return limit === null ? "Unlimited" : limit.toLocaleString();
}

function statusVariant(status: BillingSummary["status"]): "default" | "secondary" | "destructive" {
  if (status === "ACTIVE" || status === "TRIALING") {
    return "default";
  }

  if (status === "PAST_DUE") {
    return "destructive";
  }

  return "secondary";
}

export function BillingManager({ summary, checkoutStatus }: BillingManagerProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checkoutStatus === "success") {
      router.refresh();
    }
  }, [checkoutStatus, router]);

  async function startCheckout(plan: SubscriptionPlan) {
    setLoadingPlan(plan);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Checkout failed");
      }

      redirectTo(payload.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setLoadingPlan("portal");
    setError(null);

    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Portal failed");
      }

      redirectTo(payload.url);
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : "Portal failed");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      {checkoutStatus === "success" ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          Subscription updated. Changes may take a moment to appear.
        </div>
      ) : null}

      {checkoutStatus === "canceled" ? (
        <div className="rounded-lg border px-4 py-3 text-sm text-muted-foreground">
          Checkout canceled — no changes were made.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>
              Billing period {summary.period}. Usage resets monthly.
            </CardDescription>
          </div>
          <Badge variant={statusVariant(summary.status)}>{summary.status}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-semibold">{PLAN_LABELS[summary.plan]}</div>

          {summary.status === "PAST_DUE" ? (
            <p className="text-sm text-destructive">
              Payment failed — outreach is paused until billing is updated.
            </p>
          ) : null}

          {summary.status === "CANCELED" ? (
            <p className="text-sm text-muted-foreground">
              Subscription canceled — upgrade to restore full outreach.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {UPGRADEABLE_PLANS.map((plan) => (
              <Button
                key={plan}
                variant={summary.plan === plan ? "secondary" : "default"}
                disabled={loadingPlan !== null || summary.plan === plan}
                onClick={() => startCheckout(plan)}
              >
                {loadingPlan === plan ? "Redirecting…" : `Upgrade to ${PLAN_LABELS[plan]}`}
              </Button>
            ))}

            {summary.stripe_customer_id ? (
              <Button
                variant="outline"
                disabled={loadingPlan !== null}
                onClick={openPortal}
              >
                {loadingPlan === "portal" ? "Opening…" : "Manage subscription"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage this month</CardTitle>
          <CardDescription>Over-limit usage is blocked until you upgrade.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {(Object.keys(METRIC_LABELS) as Array<keyof typeof METRIC_LABELS>).map((metric) => {
            const used = summary.usage[metric];
            const limit = summary.limits[metric];
            const percent = usagePercent(used, limit);

            return (
              <div key={metric} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{METRIC_LABELS[metric]}</span>
                  <span className="text-muted-foreground">
                    {used.toLocaleString()} / {formatLimit(limit)}
                  </span>
                </div>
                {percent !== null ? (
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent >= 100 ? "bg-destructive" : percent >= 80 ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Unlimited on your plan</div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {UPGRADEABLE_PLANS.map((plan) => {
              const limits = PLAN_LIMITS[plan];

              return (
                <div key={plan} className="rounded-lg border p-4">
                  <div className="font-medium">{PLAN_LABELS[plan]}</div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>{formatLimit(limits.sms_sent)} SMS / month</li>
                    <li>{formatLimit(limits.voice_minutes)} voice minutes / month</li>
                    <li>{formatLimit(limits.customers_imported)} imports / month</li>
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
