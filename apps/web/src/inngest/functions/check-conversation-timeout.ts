import { inngest } from "../client";
import { emitConversationEnded } from "@/lib/inngest/events";
import { getConversationTimeoutDuration } from "@/lib/outreach/delay";
import { getServiceClient } from "@/lib/supabase/service";

export const checkConversationTimeout = inngest.createFunction(
  {
    id: "check-conversation-timeout",
    name: "Check conversation timeout",
    triggers: [{ event: "conversation/schedule-timeout" }],
  },
  async ({ event, step }) => {
    const { conversationId, organizationId, lastAssistantMessageId } = event.data as {
      conversationId: string;
      organizationId: string;
      lastAssistantMessageId: string;
    };

    await step.sleep("timeout-window", getConversationTimeoutDuration());

    const result = await step.run("complete-if-silent", async () => {
      const supabase = getServiceClient();

      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .select("id, status")
        .eq("id", conversationId)
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (conversationError) {
        throw conversationError;
      }

      if (!conversation || conversation.status !== "IN_PROGRESS") {
        return { completed: false, reason: "not_in_progress" };
      }

      const { data: lastMessage, error: messageError } = await supabase
        .from("messages")
        .select("id, role")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (messageError) {
        throw messageError;
      }

      if (!lastMessage || lastMessage.id !== lastAssistantMessageId || lastMessage.role !== "ASSISTANT") {
        return { completed: false, reason: "customer_replied" };
      }

      const endedAt = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("conversations")
        .update({
          status: "COMPLETED",
          ended_at: endedAt,
        })
        .eq("id", conversationId);

      if (updateError) {
        throw updateError;
      }

      return { completed: true };
    });

    if (result.completed) {
      await step.run("emit-ended", async () => {
        await emitConversationEnded({
          conversationId,
          organizationId,
          reason: "timeout",
        });
      });
    }

    return result;
  },
);
