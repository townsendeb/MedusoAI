import { createClient } from "npm:@supabase/supabase-js@2";
import { authenticateApiKey } from "../_shared/api-key-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/response.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const auth = await authenticateApiKey(req);
    if (!auth.ok) {
      return jsonResponse({ error: auth.message }, auth.status);
    }

    const url = new URL(req.url);
    const since = url.searchParams.get("since") ?? new Date(0).toISOString();

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        channel,
        status,
        started_at,
        ended_at,
        recovery_status,
        customer_id,
        created_at,
        customers ( name, phone_e164 )
      `,
      )
      .eq("organization_id", auth.organizationId)
      .eq("status", "COMPLETED")
      .gt("ended_at", since)
      .order("ended_at", { ascending: true })
      .limit(100);

    if (error) {
      throw error;
    }

    return jsonResponse({ data: data ?? [] });
  } catch (error) {
    console.error("zapier-conversations error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
