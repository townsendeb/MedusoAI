import type { RecoveryActionType, RecoveryStatus } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export async function updateConversationRecovery(
  conversationId: string,
  input: {
    recoveryStatus?: RecoveryStatus;
    action?: RecoveryActionType;
    note?: string | null;
  },
) {
  const supabase = createClient();

  if (input.recoveryStatus) {
    const { error } = await supabase
      .from("conversations")
      .update({ recovery_status: input.recoveryStatus })
      .eq("id", conversationId);

    if (error) {
      throw error;
    }
  }

  if (input.action) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const { error } = await supabase.from("recovery_actions").insert({
      conversation_id: conversationId,
      user_id: user.id,
      action: input.action,
      note: input.note ?? null,
    });

    if (error) {
      throw error;
    }
  }
}
