import { corsHeaders } from "../_shared/cors.ts";
import { validateTwilioSignature } from "../_shared/twilio.ts";
import { jsonResponse } from "../_shared/response.ts";
import { claimWebhookEvent, completeWebhookEvent } from "../_shared/webhook-events.ts";
import { getServiceClient, handleInboundSms } from "../_shared/inbound-sms.ts";

function parseFormBody(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
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

    const supabase = getServiceClient();
    await handleInboundSms(supabase, {
      providerMessageId: messageSid,
      fromE164: fromPhone,
      body,
      replyProvider: "twilio",
    });

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
