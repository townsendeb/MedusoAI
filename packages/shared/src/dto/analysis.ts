import { z } from "zod";
import { CHURN_RISKS } from "../enums";
import { COMPLAINT_CATEGORY_IDS, PRAISE_CATEGORY_IDS } from "../categories";

const categoryIdSchema = z.string().min(1);

export const conversationAnalysisOutputSchema = z.object({
  sentimentScore: z.number().min(-1).max(1),
  satisfactionScore: z.number().int().min(1).max(10),
  churnRisk: z.enum(CHURN_RISKS),
  complaintCategories: z.array(categoryIdSchema),
  praiseCategories: z.array(categoryIdSchema),
  summary: z.string().min(1).max(2000),
  recommendedAction: z.string().min(1).max(2000),
  escalationRequested: z.boolean(),
});

export type ConversationAnalysisOutput = z.infer<typeof conversationAnalysisOutputSchema>;

/** OpenAI structured output schema with controlled vocabulary */
export const conversationAnalysisOutputSchemaStrict = conversationAnalysisOutputSchema.extend({
  complaintCategories: z.array(
    z.enum(COMPLAINT_CATEGORY_IDS as [string, ...string[]]),
  ),
  praiseCategories: z.array(
    z.enum(PRAISE_CATEGORY_IDS as [string, ...string[]]),
  ),
});

export type ConversationAnalysisOutputStrict = z.infer<
  typeof conversationAnalysisOutputSchemaStrict
>;
