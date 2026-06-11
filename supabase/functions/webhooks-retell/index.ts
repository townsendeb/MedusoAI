import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { sendInngestEvent } from "../_shared/inngest.ts";
import { validateRetellSignature } from "../_shared/retell.ts";
import { jsonResponse } from "../_shared/response.ts";
import { claimWebhookEvent, completeWebhookEvent } from "../_shared/webhook-events.ts";

type RetellCall = {
  call_id?: string;
  transcript?: string;
  recording_url?: string;
  metadata?: Record<string, string>;
};

type RetellWebhookBody = {
  event?: string;
  call?: RetellCall;
};

function okResponse(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
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
    const apiKey = Deno.env.get("RETELL_API_KEY");
    const signature = req.headers.get("X-Retell-Signature");

    if (apiKey && signature) {
      const valid = await validateRetellSignature(rawBody, apiKey, signature);
      if (!valid) {
        return jsonResponse({ error: "Invalid Retell signature" }, 401);
      }
    }

    const payload = JSON.parse(rawBody) as RetellWebhookBody;
    const event = payload.event ?? "";
    const call = payload.call;
    const callId = call?.call_id;

    if (!callId) {
      return okResponse();
    }

    eventId = `${event}:${callId}`;
    const claim = await claimWebhookEvent("RETELL", eventId, payload as Record<string, unknown>);
    if (claim === "skip") {
      return okResponse();
    }

    markComplete = true;

    if (event !== "call_ended" && event !== "call_analyzed") {
      return okResponse();
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, organization_id, status, customer_id")
      .eq("retell_call_id", callId)
      .maybeSingle();

    if (conversationError) {
      throw conversationError;
    }

    if (!conversation) {
      console.info("Retell webhook for unknown call:", callId);
      return okResponse();
    }

    if (conversation.status === "COMPLETED") {
      return okResponse();
    }

    const endedAt = new Date().toISOString();
    const transcript = call?.transcript ?? null;

    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        status: "COMPLETED",
        ended_at: endedAt,
        transcript_raw: transcript,
        recording_url: call?.recording_url ?? null,
      })
      .eq("id", conversation.id);

    if (updateError) {
      throw updateError;
    }

    if (transcript) {
      const lines = transcript.split("\n").filter(Boolean);
      const messageRows = lines.map((line) => {
        const isCustomer = line.toLowerCase().startsWith("customer:") || line.toLowerCase().startsWith("user:");
        const content = line.replace(/^(customer|user|agent|assistant):\s*/i, "");
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
    console.error("webhooks-retell error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  } finally {
    if (markComplete && eventId) {
      await completeWebhookEvent(eventId);
    }
  }
});
