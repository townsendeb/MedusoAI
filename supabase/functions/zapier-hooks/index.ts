import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { authenticateApiKey } from "../_shared/api-key-auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/response.ts";

const subscribeSchema = z.object({
  eventType: z.enum(["alert.created", "conversation.completed"]),
  targetUrl: z.string().url(),
});

const unsubscribeSchema = z.object({
  eventType: z.enum(["alert.created", "conversation.completed"]),
  targetUrl: z.string().url(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await authenticateApiKey(req);
    if (!auth.ok) {
      return jsonResponse({ error: auth.message }, auth.status);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    if (req.method === "POST") {
      const body = subscribeSchema.parse(await req.json());

      const { data, error } = await supabase
        .from("zapier_subscriptions")
        .upsert(
          {
            organization_id: auth.organizationId,
            event_type: body.eventType,
            target_url: body.targetUrl,
          },
          { onConflict: "organization_id,event_type,target_url" },
        )
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      return jsonResponse({ subscriptionId: data.id }, 201);
    }

    if (req.method === "DELETE") {
      const body = unsubscribeSchema.parse(await req.json());

      const { error } = await supabase
        .from("zapier_subscriptions")
        .delete()
        .eq("organization_id", auth.organizationId)
        .eq("event_type", body.eventType)
        .eq("target_url", body.targetUrl);

      if (error) {
        throw error;
      }

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse({ error: "Invalid request", details: error.flatten() }, 400);
    }

    console.error("zapier-hooks error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
