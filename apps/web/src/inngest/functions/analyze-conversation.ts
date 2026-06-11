import { analyzeConversation } from "@meduso/shared";
import { inngest } from "../client";
import { getServiceClient } from "@/lib/supabase/service";

export const analyzeConversationJob = inngest.createFunction(
  {
    id: "analyze-conversation",
    name: "Analyze conversation",
    concurrency: { limit: 5 },
    triggers: [{ event: "conversation/ended" }],
  },
  async ({ event, step }) => {
    const { conversationId, organizationId } = event.data as {
      conversationId: string;
      organizationId: string;
      reason?: string;
    };

    const result = await step.run("analyze-and-persist", async () => {
      const supabase = getServiceClient();

      const { data: existingAnalysis } = await supabase
        .from("conversation_analyses")
        .select("id")
        .eq("conversation_id", conversationId)
        .maybeSingle();

      if (existingAnalysis) {
        return { skipped: true as const, reason: "already_analyzed", analysisId: existingAnalysis.id };
      }

      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .select("id, status, customer_id")
        .eq("id", conversationId)
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (conversationError) {
        throw conversationError;
      }

      if (!conversation) {
        return { skipped: true as const, reason: "conversation_not_found" };
      }

      if (conversation.status === "OPTED_OUT") {
        return { skipped: true as const, reason: "opted_out" };
      }

      const [{ data: messages, error: messagesError }, { data: organization, error: orgError }] =
        await Promise.all([
          supabase
            .from("messages")
            .select("role, content")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true }),
          supabase.from("organizations").select("name").eq("id", organizationId).single(),
        ]);

      if (messagesError) {
        throw messagesError;
      }

      if (orgError) {
        throw orgError;
      }

      const transcript = (messages ?? []).map((message) => ({
        role: message.role as "CUSTOMER" | "ASSISTANT" | "SYSTEM",
        content: message.content,
      }));

      const analyzed = await analyzeConversation({
        businessName: organization?.name ?? "the business",
        messages: transcript,
      });

      const { data: analysisRow, error: insertError } = await supabase
        .from("conversation_analyses")
        .insert({
          conversation_id: conversationId,
          sentiment_score: analyzed.analysis.sentimentScore,
          satisfaction_score: analyzed.analysis.satisfactionScore,
          churn_risk: analyzed.analysis.churnRisk,
          complaint_categories: analyzed.analysis.complaintCategories,
          praise_categories: analyzed.analysis.praiseCategories,
          summary: analyzed.analysis.summary,
          recommended_action: analyzed.analysis.recommendedAction,
          model: analyzed.model,
          raw_response: {
            ...analyzed.rawResponse,
            escalationRequested: analyzed.analysis.escalationRequested,
            stub: analyzed.stub,
          },
        })
        .select("id")
        .single();

      if (insertError || !analysisRow) {
        throw insertError ?? new Error("Failed to persist analysis");
      }

      await supabase
        .from("conversations")
        .update({
          transcript_raw: transcript
            .map((message) => `${message.role}: ${message.content}`)
            .join("\n"),
        })
        .eq("id", conversationId);

      return {
        skipped: false as const,
        analysisId: analysisRow.id,
        customerId: conversation.customer_id,
        analysis: analyzed.analysis,
        stub: analyzed.stub,
      };
    });

    if (result.skipped) {
      return result;
    }

    await step.sendEvent("analysis-completed", {
      name: "analysis/completed",
      data: {
        analysisId: result.analysisId,
        conversationId,
        organizationId,
        customerId: result.customerId,
      },
    });

    return {
      analyzed: true,
      analysisId: result.analysisId,
      stub: result.stub,
    };
  },
);
