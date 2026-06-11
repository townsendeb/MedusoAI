import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendInngestEvent } from "../_shared/inngest.ts";
import { generateSmsReply } from "../_shared/openai.ts";
import { sendSms, validateTwilioSignature } from "../_shared/twilio.ts";
import { jsonResponse } from "../_shared/response.ts";
import { claimWebhookEvent, completeWebhookEvent } from "../_shared/webhook-events.ts";
import { checkUsageAllowed, incrementUsage } from "../_shared/usage.ts";

const OPT_OUT_KEYWORDS = ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];

function parseFormBody(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
}

function isOptOutMessage(body: string): boolean {
  const normalized = body.trim().toUpperCase();
  return OPT_OUT_KEYWORDS.some(
    (keyword) => normalized === keyword || normalized.startsWith(`${keyword} `),
  );
}

function emptyTwiml(): Response {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { "Content-Type": "text/xml", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let eventId: string | null = null;
  let markComplete = false;

  try {
    const rawBody = await req.text();
    const params = parseFormBody(rawBody);
    const messageSid = params.MessageSid ?? params.SmsSid;

    if (!messageSid) {
      return jsonResponse({ error: "Missing MessageSid" }, 400);
    }

    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const signature = req.headers.get("X-Twilio-Signature");

    if (authToken && signature) {
      const url = new URL(req.url);
      url.search = "";
      const valid = await validateTwilioSignature(authToken, signature, url.toString(), params);

      if (!valid) {
        return jsonResponse({ error: "Invalid Twilio signature" }, 403);
      }
    }

    const claim = await claimWebhookEvent("TWILIO", messageSid, params);
    if (claim === "skip") {
      return emptyTwiml();
    }

    eventId = messageSid;
    markComplete = true;

    const fromPhone = params.From;
    const body = params.Body?.trim() ?? "";

    if (!fromPhone || !body) {
      return emptyTwiml();
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, organization_id, name, metadata")
      .eq("phone_e164", fromPhone)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (customerError) {
      throw customerError;
    }

    if (!customer) {
      console.info("Inbound SMS from unknown number:", fromPhone);
      return emptyTwiml();
    }

    if (customer.metadata?.optedOut === true) {
      return emptyTwiml();
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
      return emptyTwiml();
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

      return emptyTwiml();
    }

    const { data: customerMessage, error: customerMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        role: "CUSTOMER",
        content: body,
        channel: "SMS",
        provider_message_id: messageSid,
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

      return emptyTwiml();
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
      return emptyTwiml();
    }

    const sms = await sendSms({ to: fromPhone, body: reply.content });

    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        role: "ASSISTANT",
        content: reply.content,
        channel: "SMS",
        provider_message_id: sms.sid,
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
          lastSmsSid: sms.sid,
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

    return emptyTwiml();
  } catch (error) {
    markComplete = false;
    console.error("webhooks-twilio error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  } finally {
    if (markComplete && eventId) {
      await completeWebhookEvent(eventId);
    }
  }
});
