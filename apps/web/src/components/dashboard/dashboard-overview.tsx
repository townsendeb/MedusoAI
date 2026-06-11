"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsOverview } from "@/lib/analytics/queries";
import { queryKeys } from "@/lib/query-keys";
import { useAlertsRealtime } from "@/hooks/use-alerts-realtime";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardOverviewProps = {
  organizationId: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardOverview({ organizationId }: DashboardOverviewProps) {
  useAlertsRealtime(organizationId);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.analytics.overview(organizationId),
    queryFn: fetchAnalyticsOverview,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-destructive">
        Failed to load dashboard metrics.
      </div>
    );
  }

  const metrics = [
    { label: "Customers contacted", value: data.customersContacted.toString() },
    { label: "Conversations completed", value: data.conversationsCompleted.toString() },
    {
      label: "Recovery opportunities",
      value: data.recoveryOpportunities.toString(),
      highlight: data.recoveryOpportunities > 0,
    },
    { label: "Customers recovered", value: data.customersRecovered.toString() },
    {
      label: "Revenue protected",
      value: formatCurrency(data.revenueProtected),
      hint: "Estimated from recovered customers × avg customer value",
    },
  ];

  const hasActivity =
    data.customersContacted > 0 ||
    data.conversationsCompleted > 0 ||
    data.recoveryOpportunities > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={
                  metric.highlight ? "text-3xl font-semibold text-destructive" : "text-3xl font-semibold"
                }
              >
                {metric.value}
              </p>
              {metric.hint ? (
                <p className="mt-2 text-xs text-muted-foreground">{metric.hint}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasActivity ? (
        <EmptyState
          title="Get started"
          description="Import customers to begin SMS outreach and identify at-risk visitors before they churn."
          actions={[
            { label: "View customers", href: "/customers" },
            { label: "Create API key", href: "/settings/api-keys", variant: "outline" },
          ]}
        />
      ) : data.recoveryOpportunities > 0 ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="text-lg font-medium">Action needed</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You have {data.recoveryOpportunities} open recovery{" "}
            {data.recoveryOpportunities === 1 ? "alert" : "alerts"} waiting for review.
          </p>
          <Link href="/alerts">
            <Button className="mt-4" variant="destructive">
              Review alerts
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
