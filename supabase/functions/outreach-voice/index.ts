import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { authenticateApiKey } from "../_shared/api-key-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sendInngestEvent } from "../_shared/inngest.ts";
import { consumeRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { jsonResponse } from "../_shared/response.ts";

const API_KEY_LIMIT = 100;
const API_KEY_WINDOW_SECONDS = 60;

const triggerSchema = z.object({
  customerId: z.string().uuid(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const auth = await authenticateApiKey(req, "customers:write");
    if (!auth.ok) {
      return jsonResponse({ error: auth.message }, auth.status);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const allowed = await consumeRateLimit(
      supabase,
      `api-key:${auth.apiKeyId}`,
      API_KEY_LIMIT,
      API_KEY_WINDOW_SECONDS,
    );

    if (!allowed) {
      return rateLimitResponse(API_KEY_WINDOW_SECONDS);
    }

    const body = triggerSchema.parse(await req.json());

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", body.customerId)
      .eq("organization_id", auth.organizationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (customerError) {
      throw customerError;
    }

    if (!customer) {
      return jsonResponse({ error: "Customer not found" }, 404);
    }

    await sendInngestEvent(
      "voice/call.requested",
      {
        customerId: customer.id,
        organizationId: auth.organizationId,
      },
      `voice-call-${customer.id}-${Date.now()}`,
    );

    return jsonResponse({ ok: true }, 202);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse({ error: "Invalid request", details: error.flatten() }, 400);
    }

    console.error("outreach-voice error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
