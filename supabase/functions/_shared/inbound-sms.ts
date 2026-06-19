import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sendInngestEvent } from "./inngest.ts";
import { generateSmsReply } from "./openai.ts";
import { sendAgentPhoneMessage } from "./agentphone.ts";
import { sendSms } from "./twilio.ts";
import { checkUsageAllowed, incrementUsage } from "./usage.ts";

const OPT_OUT_KEYWORDS = ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];

export type SmsReplyProvider = "twilio" | "agentphone";

export type InboundSmsInput = {
  providerMessageId: string;
  fromE164: string;
  body: string;
  replyProvider: SmsReplyProvider;
};

export type InboundSmsResult = {
  handled: boolean;
  reason?: string;
};

function isOptOutMessage(body: string): boolean {
  const normalized = body.trim().toUpperCase();
  return OPT_OUT_KEYWORDS.some(
    (keyword) => normalized === keyword || normalized.startsWith(`${keyword} `),
  );
}

async function sendReply(
  replyProvider: SmsReplyProvider,
  to: string,
  body: string,
): Promise<{ providerMessageId: string; stub: boolean }> {
  if (replyProvider === "agentphone") {
    const result = await sendAgentPhoneMessage({ to, body });
    return { providerMessageId: result.providerMessageId, stub: result.stub };
  }

  const result = await sendSms({ to, body });
  return { providerMessageId: result.sid, stub: result.stub };
}

export async function handleInboundSms(
  supabase: SupabaseClient,
  input: InboundSmsInput,
): Promise<InboundSmsResult> {
  const { providerMessageId, fromE164, body, replyProvider } = input;

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, organization_id, name, metadata")
    .eq("phone_e164", fromE164)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (customerError) {
    throw customerError;
  }

  if (!customer) {
    console.info("Inbound SMS from unknown number:", fromE164);
    return { handled: false, reason: "unknown_customer" };
  }

  if (customer.metadata?.optedOut === true) {
    return { handled: false, reason: "opted_out" };
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, organization_id, status, provider_metadata")
    .eq("customer_id", customer.id)
    .eq("channel", "SMS")
    .eq("status", "IN_PROGRESS")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (conversationError) {
    throw conversationError;
  }

  if (!conversation) {
    return { handled: false, reason: "no_active_conversation" };
  }

  if (isOptOutMessage(body)) {
    await supabase
      .from("customers")
      .update({
        metadata: { ...(customer.metadata ?? {}), optedOut: true },
      })
      .eq("id", customer.id);

    await supabase
      .from("conversations")
      .update({
        status: "OPTED_OUT",
        ended_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);

    await sendInngestEvent(
      "conversation/ended",
      {
        conversationId: conversation.id,
        organizationId: conversation.organization_id,
        reason: "opt_out",
      },
      `conversation-ended-${conversation.id}-opt_out`,
    );

    return { handled: true, reason: "opt_out" };
  }

  const { data: customerMessage, error: customerMessageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      role: "CUSTOMER",
      content: body,
      channel: "SMS",
      provider_message_id: providerMessageId,
    })
    .select("id")
    .single();

  if (customerMessageError || !customerMessage) {
    throw customerMessageError ?? new Error("Failed to persist customer message");
  }

  const [{ data: history }, { data: settings }, { data: organization }] = await Promise.all([
    supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("outreach_settings")
      .select("max_sms_turns")
      .eq("organization_id", conversation.organization_id)
      .maybeSingle(),
    supabase
      .from("organizations")
      .select("name")
      .eq("id", conversation.organization_id)
      .single(),
  ]);

  const maxSmsTurns =
    (conversation.provider_metadata as { maxSmsTurns?: number } | null)?.maxSmsTurns ??
    settings?.max_sms_turns ??
    6;

  const assistantTurns = (history ?? []).filter((message) => message.role === "ASSISTANT").length;

  if (assistantTurns >= maxSmsTurns) {
    await sendInngestEvent(
      "conversation/max-turns-reached",
      {
        conversationId: conversation.id,
        organizationId: conversation.organization_id,
      },
      `conversation-max-turns-${conversation.id}`,
    );

    return { handled: true, reason: "max_turns_reached" };
  }

  const openAiMessages = (history ?? []).map((message) => ({
    role: message.role === "CUSTOMER" ? ("user" as const) : ("assistant" as const),
    content: message.content,
  }));

  const reply = await generateSmsReply({
    businessName: organization?.name ?? "our business",
    customerName: customer.name,
    messages: openAiMessages,
  });

  const usage = await checkUsageAllowed(conversation.organization_id, "sms_sent");
  if (!usage.allowed) {
    console.warn("SMS usage limit reached for org:", conversation.organization_id, usage);
    return { handled: false, reason: "usage_limit" };
  }

  const sms = await sendReply(replyProvider, fromE164, reply.content);

  const { data: assistantMessage, error: assistantMessageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      role: "ASSISTANT",
      content: reply.content,
      channel: "SMS",
      provider_message_id: sms.providerMessageId,
    })
    .select("id")
    .single();

  if (assistantMessageError || !assistantMessage) {
    throw assistantMessageError ?? new Error("Failed to persist assistant message");
  }

  await incrementUsage(conversation.organization_id, "sms_sent");

  await supabase
    .from("conversations")
    .update({
      provider_metadata: {
        ...(conversation.provider_metadata as Record<string, unknown>),
        lastAssistantMessageId: assistantMessage.id,
        lastSmsProviderMessageId: sms.providerMessageId,
        stub: sms.stub || reply.stub,
      },
    })
    .eq("id", conversation.id);

  await sendInngestEvent(
    "conversation/schedule-timeout",
    {
      conversationId: conversation.id,
      organizationId: conversation.organization_id,
      lastAssistantMessageId: assistantMessage.id,
    },
    `conversation-timeout-${conversation.id}-${assistantMessage.id}`,
  );

  return { handled: true };
}

export function getServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase service credentials are not configured");
  }

  return createClient(supabaseUrl, serviceKey);
}
