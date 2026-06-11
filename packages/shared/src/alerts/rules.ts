import type { ConversationAnalysisOutput } from "../dto/analysis";
import type { AlertSeverity, AlertType } from "../enums";

export type AlertCandidate = {
  type: AlertType;
  severity: AlertSeverity;
};

const SEVERITY_RANK: Record<AlertSeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

function pickHigherSeverity(a: AlertSeverity, b: AlertSeverity): AlertSeverity {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}

/** Deterministic alert rules applied after LLM analysis (see architecture plan). */
export function deriveAlertsFromAnalysis(
  output: ConversationAnalysisOutput,
): AlertCandidate[] {
  const byType = new Map<AlertType, AlertSeverity>();

  function add(type: AlertType, severity: AlertSeverity) {
    const existing = byType.get(type);
    byType.set(type, existing ? pickHigherSeverity(existing, severity) : severity);
  }

  if (output.escalationRequested) {
    add("ESCALATION_REQUESTED", "CRITICAL");
  }

  if (output.churnRisk === "HIGH") {
    add("HIGH_CHURN_RISK", "HIGH");
  }

  if (output.sentimentScore < -0.3) {
    add("NEGATIVE_SENTIMENT", output.sentimentScore <= -0.6 ? "HIGH" : "MEDIUM");
  } else if (output.satisfactionScore <= 4) {
    add("NEGATIVE_SENTIMENT", "MEDIUM");
  }

  return Array.from(byType.entries()).map(([type, severity]) => ({ type, severity }));
}
