import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { authenticateApiKey } from "../_shared/api-key-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sendInngestEvent } from "../_shared/inngest.ts";
import { normalizePhoneE164 } from "../_shared/phone.ts";
import { consumeRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { jsonResponse } from "../_shared/response.ts";
import { checkUsageAllowed, incrementUsage } from "../_shared/usage.ts";

const API_KEY_LIMIT = 100;
const API_KEY_WINDOW_SECONDS = 60;

const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1),
  email: z.string().trim().email().optional().nullable(),
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  location: z.string().trim().min(1).max(120).optional().nullable(),
  externalId: z.string().trim().min(1).max(200).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
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

    const body = createCustomerSchema.parse(await req.json());
    const idempotencyKey = req.headers.get("Idempotency-Key") ?? body.externalId ?? null;
    const phoneE164 = normalizePhoneE164(body.phone);

    if (idempotencyKey) {
      const { data: existingByExternal } = await supabase
        .from("customers")
        .select("*")
        .eq("organization_id", auth.organizationId)
        .eq("external_id", idempotencyKey)
        .is("deleted_at", null)
        .maybeSingle();

      if (existingByExternal) {
        return jsonResponse({ data: existingByExternal }, 200);
      }
    }

    const { data: existingByPhone } = await supabase
      .from("customers")
      .select("*")
      .eq("organization_id", auth.organizationId)
      .eq("phone_e164", phoneE164)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingByPhone) {
      return jsonResponse(
        { error: "Customer with this phone already exists", data: existingByPhone },
        409,
      );
    }

    const usage = await checkUsageAllowed(auth.organizationId, "customers_imported");
    if (!usage.allowed) {
      return jsonResponse(
        {
          error: "Monthly customer import limit reached",
          reason: usage.reason ?? "usage_limit_exceeded",
        },
        402,
      );
    }

    const metadata = {
      ...(body.metadata ?? {}),
      ...(body.location ? { location: body.location } : {}),
    };

    const { data, error } = await supabase
      .from("customers")
      .insert({
        organization_id: auth.organizationId,
        name: body.name,
        phone_e164: phoneE164,
        email: body.email ?? null,
        last_visit_date: body.visitDate ?? null,
        external_id: body.externalId ?? idempotencyKey,
        metadata,
        source: "API",
      })
      .select()
      .single();

    if (error) {
      console.error("create customer error:", error);
      return jsonResponse({ error: "Failed to create customer" }, 500);
    }

    await incrementUsage(auth.organizationId, "customers_imported");

    try {
      await sendInngestEvent(
        "customer/created",
        {
          customerId: data.id,
          organizationId: auth.organizationId,
        },
        `customer-${data.id}-outreach`,
      );
    } catch (eventError) {
      console.error("failed to schedule outreach:", eventError);
    }

    return jsonResponse({ data }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse({ error: "Invalid request", details: error.flatten() }, 400);
    }

    console.error("customers function error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
