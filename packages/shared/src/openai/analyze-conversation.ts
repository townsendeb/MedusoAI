import {
  COMPLAINT_CATEGORY_IDS,
  PRAISE_CATEGORY_IDS,
} from "../categories";
import {
  conversationAnalysisOutputSchema,
  type ConversationAnalysisOutput,
} from "../dto/analysis";
import { getOpenAiApiKey } from "./config";
import { stubAnalyzeConversation } from "./stub-analyze-conversation";

export type AnalyzeConversationInput = {
  businessName: string;
  messages: { role: "CUSTOMER" | "ASSISTANT" | "SYSTEM"; content: string }[];
};

export type AnalyzeConversationResult = {
  analysis: ConversationAnalysisOutput;
  model: string;
  stub: boolean;
  rawResponse: Record<string, unknown>;
};

const ANALYSIS_MODEL = "gpt-4o-mini";

function filterCategoryIds(ids: string[], allowed: readonly string[]): string[] {
  const allowedSet = new Set(allowed);
  return [...new Set(ids.filter((id) => allowedSet.has(id)))];
}

function buildTranscript(messages: AnalyzeConversationInput["messages"]): string {
  return messages
    .map((message) => {
      const speaker =
        message.role === "CUSTOMER"
          ? "Customer"
          : message.role === "ASSISTANT"
            ? "Assistant"
            : "System";
      return `${speaker}: ${message.content}`;
    })
    .join("\n");
}

export async function analyzeConversation(
  input: AnalyzeConversationInput,
  apiKey?: string | null,
): Promise<AnalyzeConversationResult> {
  const key = apiKey ?? getOpenAiApiKey();

  if (!key) {
    console.info("[openai:stub] Conversation analysis — OPENAI_API_KEY not configured");
    const analysis = stubAnalyzeConversation(input.messages);
    return {
      analysis,
      model: "stub-heuristic",
      stub: true,
      rawResponse: { stub: true },
    };
  }

  const complaintIds = COMPLAINT_CATEGORY_IDS.join(", ");
  const praiseIds = PRAISE_CATEGORY_IDS.join(", ");

  const systemPrompt = [
    `You analyze post-visit customer SMS conversations for ${input.businessName}.`,
    "Return structured JSON only.",
    `Complaint category ids (pick any that apply): ${complaintIds}`,
    `Praise category ids (pick any that apply): ${praiseIds}`,
    "sentimentScore is -1 (very negative) to 1 (very positive).",
    "satisfactionScore is 1 (worst) to 10 (best).",
    "churnRisk is LOW, MEDIUM, or HIGH.",
    "escalationRequested is true if the customer asked for a manager, refund, or formal complaint.",
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ANALYSIS_MODEL,
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "conversation_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              sentimentScore: { type: "number", minimum: -1, maximum: 1 },
              satisfactionScore: { type: "integer", minimum: 1, maximum: 10 },
              churnRisk: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
              complaintCategories: { type: "array", items: { type: "string" } },
              praiseCategories: { type: "array", items: { type: "string" } },
              summary: { type: "string" },
              recommendedAction: { type: "string" },
              escalationRequested: { type: "boolean" },
            },
            required: [
              "sentimentScore",
              "satisfactionScore",
              "churnRisk",
              "complaintCategories",
              "praiseCategories",
              "summary",
              "recommendedAction",
              "escalationRequested",
            ],
          },
        },
      },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this conversation transcript:\n\n${buildTranscript(input.messages)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI analysis failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned empty analysis");
  }

  const parsed = JSON.parse(content) as Record<string, unknown>;
  const validated = conversationAnalysisOutputSchema.parse({
    ...parsed,
    complaintCategories: filterCategoryIds(
      (parsed.complaintCategories as string[]) ?? [],
      COMPLAINT_CATEGORY_IDS,
    ),
    praiseCategories: filterCategoryIds(
      (parsed.praiseCategories as string[]) ?? [],
      PRAISE_CATEGORY_IDS,
    ),
  });

  return {
    analysis: validated,
    model: ANALYSIS_MODEL,
    stub: false,
    rawResponse: parsed,
  };
}
