import { conversationAnalysisOutputSchema, deriveAlertsFromAnalysis } from "@meduso/shared";
import { inngest } from "../client";
import { getServiceClient } from "@/lib/supabase/service";

export const createAlerts = inngest.createFunction(
  {
    id: "create-alerts",
    name: "Create alerts",
    triggers: [{ event: "analysis/completed" }],
  },
  async ({ event, step }) => {
    const { analysisId, conversationId, organizationId, customerId } = event.data as {
      analysisId: string;
      conversationId: string;
      organizationId: string;
      customerId: string;
    };

    const created = await step.run("create-alert-rows", async () => {
      const supabase = getServiceClient();

      const { data: analysis, error: analysisError } = await supabase
        .from("conversation_analyses")
        .select("*")
        .eq("id", analysisId)
        .eq("conversation_id", conversationId)
        .single();

      if (analysisError || !analysis) {
        throw analysisError ?? new Error("Analysis not found");
      }

      const output = conversationAnalysisOutputSchema.parse({
        sentimentScore: Number(analysis.sentiment_score),
        satisfactionScore: analysis.satisfaction_score,
        churnRisk: analysis.churn_risk,
        complaintCategories: analysis.complaint_categories,
        praiseCategories: analysis.praise_categories,
        summary: analysis.summary,
        recommendedAction: analysis.recommended_action,
        escalationRequested:
          (analysis.raw_response as { escalationRequested?: boolean }).escalationRequested ??
          false,
      });

      const candidates = deriveAlertsFromAnalysis(output);

      if (!candidates.length) {
        return { created: [] as string[] };
      }

      const { data: existingAlerts } = await supabase
        .from("alerts")
        .select("type")
        .eq("conversation_id", conversationId);

      const existingTypes = new Set((existingAlerts ?? []).map((alert) => alert.type));
      const alertIds: string[] = [];

      for (const candidate of candidates) {
        if (existingTypes.has(candidate.type)) {
          continue;
        }

        const { data: alert, error: insertError } = await supabase
          .from("alerts")
          .insert({
            organization_id: organizationId,
            conversation_id: conversationId,
            customer_id: customerId,
            type: candidate.type,
            severity: candidate.severity,
            status: "OPEN",
            summary: output.summary,
            recommended_action: output.recommendedAction,
          })
          .select("id")
          .single();

        if (insertError || !alert) {
          throw insertError ?? new Error("Failed to create alert");
        }

        alertIds.push(alert.id);
        existingTypes.add(candidate.type);
      }

      if (alertIds.length > 0) {
        const hasHighSeverity = candidates.some(
          (candidate) => candidate.severity === "HIGH" || candidate.severity === "CRITICAL",
        );

        if (hasHighSeverity) {
          await supabase
            .from("conversations")
            .update({ recovery_status: "IN_RECOVERY" })
            .eq("id", conversationId)
            .eq("recovery_status", "OPEN");
        }
      }

      return { created: alertIds };
    });

    for (const alertId of created.created) {
      await step.sendEvent(`alert-created-${alertId}`, {
        name: "alert/created",
        data: {
          alertId,
          organizationId,
          conversationId,
          customerId,
        },
      });
    }

    return {
      conversationId,
      alertsCreated: created.created.length,
      alertIds: created.created,
    };
  },
);
