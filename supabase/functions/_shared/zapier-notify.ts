import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export type ZapierEventType = "alert.created" | "conversation.completed";

export async function dispatchZapierWebhooks(
  supabase: SupabaseClient,
  organizationId: string,
  eventType: ZapierEventType,
  payload: Record<string, unknown>,
): Promise<void> {
  const { data: subscriptions, error } = await supabase
    .from("zapier_subscriptions")
    .select("id, target_url")
    .eq("organization_id", organizationId)
    .eq("event_type", eventType);

  if (error) {
    console.error("zapier subscriptions lookup error:", error);
    return;
  }

  if (!subscriptions?.length) {
    return;
  }

  const body = JSON.stringify({
    event: eventType,
    organizationId,
    data: payload,
    timestamp: new Date().toISOString(),
  });

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      const response = await fetch(subscription.target_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        console.error(
          `zapier webhook failed (${subscription.id}):`,
          response.status,
          await response.text(),
        );
      }
    }),
  );
}

export function getServiceSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase service credentials are not configured");
  }

  return createClient(supabaseUrl, serviceKey);
}
