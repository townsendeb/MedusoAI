import type { AlertSeverity } from "@meduso/shared";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<AlertSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const VARIANTS: Record<AlertSeverity, "default" | "secondary" | "outline" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "destructive",
  CRITICAL: "destructive",
};

export function AlertSeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <Badge variant={VARIANTS[severity]}>{LABELS[severity]}</Badge>;
}
