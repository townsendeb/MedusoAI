import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { corsHeaders } from "../_shared/cors.ts";
import { sendInngestEvent } from "../_shared/inngest.ts";
import { consumeRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { jsonResponse } from "../_shared/response.ts";

const IMPORT_LIMIT = 10;
const IMPORT_WINDOW_SECONDS = 3600;

const importRequestSchema = z.object({
  storagePath: z.string().min(1),
  fileName: z.string().min(1).max(255),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "Profile not found" }, 403);
    }

    const body = importRequestSchema.parse(await req.json());
    const organizationId = profile.organization_id as string;

    if (!body.storagePath.startsWith(`${organizationId}/`)) {
      return jsonResponse({ error: "Invalid storage path" }, 403);
    }

    const importAllowed = await consumeRateLimit(
      supabase,
      `import:${organizationId}`,
      IMPORT_LIMIT,
      IMPORT_WINDOW_SECONDS,
    );

    if (!importAllowed) {
      return rateLimitResponse(IMPORT_WINDOW_SECONDS);
    }

    const { data: importRecord, error: importError } = await supabase
      .from("customer_imports")
      .insert({
        organization_id: organizationId,
        file_name: body.fileName,
        source: "CSV",
        status: "PROCESSING",
      })
      .select("id")
      .single();

    if (importError || !importRecord) {
      console.error("import record error:", importError);
      return jsonResponse({ error: "Failed to create import" }, 500);
    }

    await sendInngestEvent(
      "customer/import.parse",
      {
        importId: importRecord.id,
        organizationId,
        storagePath: body.storagePath,
      },
      `import-${importRecord.id}`,
    );

    return jsonResponse({ importId: importRecord.id, status: "PROCESSING" }, 202);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse({ error: "Invalid request", details: error.flatten() }, 400);
    }

    console.error("import function error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
