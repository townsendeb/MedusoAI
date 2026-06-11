"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAlerts } from "@/lib/alerts/queries";
import { updateAlertStatus } from "@/lib/alerts/mutations";
import { formatDateTime, formatPhone } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { useAlertsRealtime } from "@/hooks/use-alerts-realtime";
import { AlertSeverityBadge } from "@/components/alerts/alert-severity-badge";
import { AlertStatusBadge } from "@/components/alerts/alert-status-badge";
import { AlertTypeLabel } from "@/components/alerts/alert-type-label";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AlertsInboxProps = {
  organizationId: string;
};

export function AlertsInbox({ organizationId }: AlertsInboxProps) {
  const queryClient = useQueryClient();
  useAlertsRealtime(organizationId);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.alerts.all(organizationId),
    queryFn: fetchAlerts,
  });

  const mutation = useMutation({
    mutationFn: ({
      alertId,
      status,
    }: {
      alertId: string;
      status: "ACKNOWLEDGED" | "RESOLVED";
    }) => updateAlertStatus(alertId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all(organizationId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.overview(organizationId),
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-destructive">
          Failed to load alerts: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No alerts yet"
        description="At-risk customers will appear here when conversations are analyzed."
        actions={[
          { label: "View conversations", href: "/conversations", variant: "outline" },
          { label: "View customers", href: "/customers" },
        ]}
      />
    );
  }

  const openCount = data.filter((alert) => alert.status === "OPEN").length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {openCount} open alert{openCount === 1 ? "" : "s"} · updates live
      </p>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Alert</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Link
                    href={`/conversations/${alert.conversation_id}`}
                    className="font-medium hover:underline"
                  >
                    {alert.customers.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatPhone(alert.customers.phone_e164)}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">
                      <AlertTypeLabel type={alert.type} />
                    </p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{alert.summary}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <AlertSeverityBadge severity={alert.severity} />
                </TableCell>
                <TableCell>
                  <AlertStatusBadge status={alert.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(alert.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {alert.status === "OPEN" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({ alertId: alert.id, status: "ACKNOWLEDGED" })
                        }
                      >
                        Acknowledge
                      </Button>
                    ) : null}
                    {alert.status !== "RESOLVED" ? (
                      <Button
                        size="sm"
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({ alertId: alert.id, status: "RESOLVED" })
                        }
                      >
                        Resolve
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
