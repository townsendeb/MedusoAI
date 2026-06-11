import { inngest } from "../client";
import { emitConversationEnded } from "@/lib/inngest/events";
import { getServiceClient } from "@/lib/supabase/service";

/** Placeholder for slice 3.x analysis — completes conversation when max SMS turns reached. */
export const endConversationOnMaxTurns = inngest.createFunction(
  {
    id: "end-conversation-on-max-turns",
    name: "End conversation on max turns",
    triggers: [{ event: "conversation/max-turns-reached" }],
  },
  async ({ event, step }) => {
    const { conversationId, organizationId } = event.data as {
      conversationId: string;
      organizationId: string;
    };

    await step.run("complete-conversation", async () => {
      const supabase = getServiceClient();
      const endedAt = new Date().toISOString();

      const { error } = await supabase
        .from("conversations")
        .update({
          status: "COMPLETED",
          ended_at: endedAt,
        })
        .eq("id", conversationId)
        .eq("organization_id", organizationId)
        .eq("status", "IN_PROGRESS");

      if (error) {
        throw error;
      }

      await emitConversationEnded({
        conversationId,
        organizationId,
        reason: "max_turns",
      });
    });

    return { conversationId, completed: true };
  },
);
