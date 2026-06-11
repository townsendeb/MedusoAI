import type { AlertType } from "@meduso/shared";

const LABELS: Record<AlertType, string> = {
  NEGATIVE_SENTIMENT: "Negative sentiment",
  HIGH_CHURN_RISK: "High churn risk",
  ESCALATION_REQUESTED: "Escalation requested",
};

export function AlertTypeLabel({ type }: { type: AlertType }) {
  return LABELS[type];
}
