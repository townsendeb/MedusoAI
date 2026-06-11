import type { AlertStatus } from "@meduso/shared";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<AlertStatus, string> = {
  OPEN: "Open",
  ACKNOWLEDGED: "Acknowledged",
  RESOLVED: "Resolved",
};

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const variant =
    status === "OPEN" ? "default" : status === "ACKNOWLEDGED" ? "secondary" : "outline";

  return <Badge variant={variant}>{LABELS[status]}</Badge>;
}
