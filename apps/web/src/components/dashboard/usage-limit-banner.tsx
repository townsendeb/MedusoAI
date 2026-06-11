import Link from "next/link";
import { PLAN_LABELS } from "@meduso/shared";
import type { BillingSummary } from "@/lib/billing/types";
import { isNearLimit } from "@/lib/billing/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UsageLimitBannerProps = {
  summary: BillingSummary;
};

export function UsageLimitBanner({ summary }: UsageLimitBannerProps) {
  if (summary.status === "PAST_DUE" || summary.status === "CANCELED") {
    return (
      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          {summary.status === "PAST_DUE"
            ? "Your subscription payment failed. Outreach is paused until billing is updated."
            : "Your subscription is canceled. Upgrade to resume outreach."}
        </p>
        <Link
          href="/settings/billing"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Update billing
        </Link>
      </div>
    );
  }

  const warnings: string[] = [];

  if (isNearLimit(summary.usage.sms_sent, summary.limits.sms_sent)) {
    warnings.push("SMS");
  }

  if (isNearLimit(summary.usage.voice_minutes, summary.limits.voice_minutes)) {
    warnings.push("voice");
  }

  if (isNearLimit(summary.usage.customers_imported, summary.limits.customers_imported)) {
    warnings.push("imports");
  }

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-amber-950">
        You&apos;re nearing your monthly {warnings.join(", ")} limit on the{" "}
        {PLAN_LABELS[summary.plan]} plan.
      </p>
      <Link href="/settings/billing" className={cn(buttonVariants({ size: "sm" }))}>
        Upgrade plan
      </Link>
    </div>
  );
}
