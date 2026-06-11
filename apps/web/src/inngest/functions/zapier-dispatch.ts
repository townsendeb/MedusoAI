import { inngest } from "../client";
import { dispatchZapierWebhooks } from "@/lib/zapier/notify";
import { getServiceClient } from "@/lib/supabase/service";

export const zapierDispatch = inngest.createFunction(
  {
    id: "zapier-dispatch",
    name: "Zapier webhook dispatch",
    triggers: [
      { event: "alert/created" },
      { event: "conversation/ended" },
    ],
  },
  async ({ event, step }) => {
    await step.run("dispatch-webhooks", async () => {
      const supabase = getServiceClient();

      if (event.name === "alert/created") {
        const { alertId, organizationId } = event.data as {
          alertId: string;
          organizationId: string;
        };

        const { data: alert } = await supabase
          .from("alerts")
          .select("id, type, severity, status, summary, recommended_action, customer_id, conversation_id, created_at")
          .eq("id", alertId)
          .single();

        if (alert) {
          await dispatchZapierWebhooks(organizationId, "alert.created", alert);
        }

        return { eventType: "alert.created", alertId };
      }

      const { conversationId, organizationId } = event.data as {
        conversationId: string;
        organizationId: string;
      };

      const { data: conversation } = await supabase
        .from("conversations")
        .select(
          `
          id,
          channel,
          status,
          started_at,
          ended_at,
          recovery_status,
          customer_id,
          customers ( name, phone_e164 )
        `,
        )
        .eq("id", conversationId)
        .single();

      if (conversation) {
        await dispatchZapierWebhooks(organizationId, "conversation.completed", conversation);
      }

      return { eventType: "conversation.completed", conversationId };
    });
  },
);
