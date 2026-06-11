import type { ConversationAnalysisOutput } from "../dto/analysis";

type TranscriptMessage = {
  role: "CUSTOMER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

const NEGATIVE_PATTERN =
  /\b(bad|terrible|awful|horrible|frustrat|disappoint|unhappy|angry|rude|waited|billing|overcharg)\b/i;

const POSITIVE_PATTERN =
  /\b(great|excellent|amazing|wonderful|happy|love|fantastic|friendly|recommend)\b/i;

/** Heuristic analysis when OPENAI_API_KEY is not configured. */
export function stubAnalyzeConversation(
  messages: TranscriptMessage[],
): ConversationAnalysisOutput {
  const customerText = messages
    .filter((message) => message.role === "CUSTOMER")
    .map((message) => message.content)
    .join(" ");

  const hasNegative = NEGATIVE_PATTERN.test(customerText);
  const hasPositive = POSITIVE_PATTERN.test(customerText);

  let sentimentScore = 0.1;
  let satisfactionScore = 7;
  let churnRisk: ConversationAnalysisOutput["churnRisk"] = "LOW";

  if (hasNegative && !hasPositive) {
    sentimentScore = -0.55;
    satisfactionScore = 3;
    churnRisk = "HIGH";
  } else if (hasNegative) {
    sentimentScore = -0.35;
    satisfactionScore = 5;
    churnRisk = "MEDIUM";
  } else if (hasPositive) {
    sentimentScore = 0.65;
    satisfactionScore = 9;
    churnRisk = "LOW";
  } else if (!customerText.trim()) {
    sentimentScore = 0;
    satisfactionScore = 5;
    churnRisk = "MEDIUM";
  }

  return {
    sentimentScore,
    satisfactionScore,
    churnRisk,
    complaintCategories: hasNegative ? ["unmet_expectations"] : [],
    praiseCategories: hasPositive ? ["friendly_staff"] : [],
    summary: customerText.trim()
      ? `Customer shared feedback via SMS (${customerText.slice(0, 120)}${customerText.length > 120 ? "…" : ""}).`
      : "Customer did not reply to the outreach SMS.",
    recommendedAction: hasNegative
      ? "Reach out within 24 hours to acknowledge concerns and offer a recovery path."
      : "No immediate action required. Monitor for follow-up messages.",
    escalationRequested: /\b(manager|supervisor|lawyer|sue|refund now)\b/i.test(customerText),
  };
}
