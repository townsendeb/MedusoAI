import type {
  Conversation,
  ConversationAnalysis,
  Customer,
  Message,
  RecoveryAction,
} from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export type ConversationListItem = Conversation & {
  customers: Pick<Customer, "id" | "name" | "phone_e164">;
};

export type ConversationDetail = Conversation & {
  customers: Pick<Customer, "id" | "name" | "phone_e164" | "email">;
  messages: Message[];
  analysis: ConversationAnalysis | null;
  recovery_actions: RecoveryAction[];
};

export async function fetchConversations(): Promise<ConversationListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      customers ( id, name, phone_e164 )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ConversationListItem[];
}

export async function fetchConversation(conversationId: string): Promise<ConversationDetail> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      customers ( id, name, phone_e164, email ),
      messages ( id, role, content, channel, created_at ),
      conversation_analyses (
        id,
        sentiment_score,
        satisfaction_score,
        churn_risk,
        complaint_categories,
        praise_categories,
        summary,
        recommended_action,
        model,
        analyzed_at
      ),
      recovery_actions (
        id,
        action,
        note,
        created_at,
        user_id
      )
    `,
    )
    .eq("id", conversationId)
    .single();

  if (error) {
    throw error;
  }

  const messages = [...(data.messages ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const rawAnalysis = data.conversation_analyses;
  const analysis = Array.isArray(rawAnalysis) ? (rawAnalysis[0] ?? null) : rawAnalysis;
  const recoveryActions = [...(data.recovery_actions ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    ...data,
    messages,
    analysis,
    recovery_actions: recoveryActions,
  } as ConversationDetail;
}
