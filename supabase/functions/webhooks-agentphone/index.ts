import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyAgentPhoneWebhookRequest } from "../_shared/agentphone.ts";
import { sendInngestEvent } from "../_shared/inngest.ts";
import { getServiceClient, handleInboundSms } from "../_shared/inbound-sms.ts";
import { jsonResponse } from "../_shared/response.ts";
import { claimWebhookEvent, completeWebhookEvent } from "../_shared/webhook-events.ts";

type TranscriptLine = {
  role: string;
  content: string;
};

type AgentPhoneWebhookPayload = {
  event?: string;
  channel?: string;
  data?: {
    callId?: string;
    from?: string;
    to?: string;
    message?: string;
    direction?: string;
    conversationId?: string;
    receivedAt?: string;
    transcript?: TranscriptLine[] | string;
    endedAt?: string;
  };
};

type VoiceConversation = {
  id: string;
  organization_id: string;
  status: string;
  customer_id: string;
  provider_call_id: string | null;
};

function okResponse(): Response {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function transcriptToRaw(transcript: TranscriptLine[] | string | undefined): string | null {
  if (!transcript) {
    return null;
  }

  if (typeof transcript === "string") {
    return transcript;
  }

  return transcript
    .map((line) => {
      const speaker = line.role === "user" ? "Customer" : "Assistant";
      return `${speaker}: ${line.content}`;
    })
    .join("\n");
}

function customerPhoneFromCallEnded(data: AgentPhoneWebhookPayload["data"]): string | null {
  if (!data) {
    return null;
  }

  if (data.direction === "inbound") {
    return data.from ?? null;
  }

  return data.to ?? data.from ?? null;
}

async function findVoiceConversationByCallId(
  supabase: SupabaseClient,
  callId: string,
): Promise<VoiceConversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, organization_id, status, customer_id, provider_call_id")
    .eq("provider_call_id", callId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function findInProgressVoiceConversationByPhone(
  supabase: SupabaseClient,
  phoneE164: string,
): Promise<VoiceConversation | null> {
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone_e164", phoneE164)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (customerError) {
    throw customerError;
  }

  if (!customer) {
    return null;
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, organization_id, status, customer_id, provider_call_id")
    .eq("customer_id", customer.id)
    .eq("channel", "VOICE")
    .eq("status", "IN_PROGRESS")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (conversationError) {
    throw conversationError;
  }

  return conversation;
}

async function resolveVoiceConversation(
  supabase: SupabaseClient,
  callId: string,
  data: AgentPhoneWebhookPayload["data"],
): Promise<VoiceConversation | null> {
  const byCallId = await findVoiceConversationByCallId(supabase, callId);
  if (byCallId) {
    return byCallId;
  }

  const customerPhone = customerPhoneFromCallEnded(data);
  if (!customerPhone) {
    return null;
  }

  const byPhone = await findInProgressVoiceConversationByPhone(supabase, customerPhone);
  if (!byPhone) {
    return null;
  }

  if (!byPhone.provider_call_id) {
    const { error } = await supabase
      .from("conversations")
      .update({ provider_call_id: callId })
      .eq("id", byPhone.id)
      .is("provider_call_id", null);

    if (error) {
      throw error;
    }

    byPhone.provider_call_id = callId;
  }

  return byPhone;
}

async function handleCallEnded(payload: AgentPhoneWebhookPayload): Promise<Response> {
  const callId = payload.data?.callId;
  if (!callId) {
    return okResponse();
  }

  const eventId = `call_ended:${callId}`;
  let markComplete = false;

  try {
    const claim = await claimWebhookEvent("AGENTPHONE", eventId, payload as Record<string, unknown>);
    if (claim === "skip") {
      return okResponse();
    }

    const supabase = getServiceClient();
    const conversation = await resolveVoiceConversation(supabase, callId, payload.data);

    if (!conversation) {
      console.info("AgentPhone call_ended for unknown call (will retry):", callId);
      return jsonResponse({ error: "Conversation not found" }, 503);
    }

    markComplete = true;

    if (conversation.status === "COMPLETED") {
      return okResponse();
    }

    const endedAt = payload.data?.endedAt ?? new Date().toISOString();
    const transcriptRaw = transcriptToRaw(payload.data?.transcript);

    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        status: "COMPLETED",
        ended_at: endedAt,
        transcript_raw: transcriptRaw,
        provider_call_id: callId,
      })
      .eq("id", conversation.id);

    if (updateError) {
      throw updateError;
    }

    if (payload.data?.transcript && Array.isArray(payload.data.transcript)) {
      const messageRows = payload.data.transcript.map((line) => ({
        conversation_id: conversation.id,
        role: line.role === "user" ? "CUSTOMER" : "ASSISTANT",
        content: line.content,
        channel: "VOICE" as const,
      }));

      if (messageRows.length > 0) {
        await supabase.from("messages").insert(messageRows);
      }
    } else if (transcriptRaw) {
      const lines = transcriptRaw.split("\n").filter(Boolean);
      const messageRows = lines.map((line) => {
        const isCustomer = line.toLowerCase().startsWith("customer:");
        const content = line.replace(/^(customer|assistant):\s*/i, "");
        return {
          conversation_id: conversation.id,
          role: isCustomer ? "CUSTOMER" : "ASSISTANT",
          content,
          channel: "VOICE" as const,
        };
      });

      if (messageRows.length > 0) {
        await supabase.from("messages").insert(messageRows);
      }
    }

    await sendInngestEvent(
      "conversation/ended",
      {
        conversationId: conversation.id,
        organizationId: conversation.organization_id,
        reason: "manual",
      },
      `conversation-ended-${conversation.id}-voice`,
    );

    return okResponse();
  } catch (error) {
    markComplete = false;
    console.error("webhooks-agentphone call_ended error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  } finally {
    if (markComplete && eventId) {
      await completeWebhookEvent(eventId);
    }
  }
}

async function handleInboundAgentPhoneSms(
  payload: AgentPhoneWebhookPayload,
  webhookId: string | null,
  rawBody: string,
): Promise<Response> {
  const fromPhone = payload.data?.from;
  const body = payload.data?.message?.trim() ?? "";

  if (!fromPhone || !body) {
    return okResponse();
  }

  const messageId =
    webhookId ??
    `${payload.data?.conversationId ?? "unknown"}:${payload.data?.receivedAt ?? rawBody.length}`;

  let eventId: string | null = null;
  let markComplete = false;

  try {
    const claim = await claimWebhookEvent("AGENTPHONE", messageId, payload as Record<string, unknown>);
    if (claim === "skip") {
      return okResponse();
    }

    eventId = messageId;
    markComplete = true;

    const supabase = getServiceClient();
    await handleInboundSms(supabase, {
      providerMessageId: messageId,
      fromE164: fromPhone,
      body,
      replyProvider: "agentphone",
    });

    return okResponse();
  } catch (error) {
    markComplete = false;
    console.error("webhooks-agentphone sms error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  } finally {
    if (markComplete && eventId) {
      await completeWebhookEvent(eventId);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const rawBody = await req.text();
    const auth = await verifyAgentPhoneWebhookRequest(
      rawBody,
      req.headers.get("X-Webhook-Signature"),
      req.headers.get("X-Webhook-Timestamp"),
    );

    if (!auth.ok) {
      return jsonResponse({ error: auth.message }, auth.status);
    }

    const payload = JSON.parse(rawBody) as AgentPhoneWebhookPayload;
    const event = payload.event ?? "";
    const channel = payload.channel ?? "";
    const webhookId = req.headers.get("X-Webhook-ID");

    if (event === "agent.call_ended" && channel === "voice") {
      return handleCallEnded(payload);
    }

    if (event === "agent.reaction") {
      return okResponse();
    }

    if (event === "agent.message" && channel === "voice") {
      return okResponse();
    }

    if (event !== "agent.message" || (channel !== "sms" && channel !== "mms")) {
      return okResponse();
    }

    return handleInboundAgentPhoneSms(payload, webhookId, rawBody);
  } catch (error) {
    console.error("webhooks-agentphone error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
