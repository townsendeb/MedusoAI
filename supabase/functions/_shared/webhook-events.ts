import { createClient } from "npm:@supabase/supabase-js@2";

export type WebhookClaimResult = "process" | "skip";

function getServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase service credentials are not configured");
  }

  return createClient(supabaseUrl, serviceKey);
}

export async function claimWebhookEvent(
  provider: "TWILIO" | "RETELL" | "STRIPE",
  externalEventId: string,
  payload: Record<string, unknown>,
): Promise<WebhookClaimResult> {
  const supabase = getServiceClient();

  const { error } = await supabase.from("webhook_events").insert({
    provider,
    external_event_id: externalEventId,
    payload,
    processed_at: null,
  });

  if (!error) {
    return "process";
  }

  if (error.code !== "23505") {
    throw error;
  }

  const { data, error: fetchError } = await supabase
    .from("webhook_events")
    .select("processed_at")
    .eq("external_event_id", externalEventId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (data?.processed_at) {
    return "skip";
  }

  return "process";
}

export async function completeWebhookEvent(externalEventId: string): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("external_event_id", externalEventId)
    .is("processed_at", null);

  if (error) {
    throw error;
  }
}

/** @deprecated Use claimWebhookEvent + completeWebhookEvent */
export async function recordWebhookEventIfNew(
  provider: "TWILIO" | "RETELL" | "STRIPE",
  externalEventId: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const claim = await claimWebhookEvent(provider, externalEventId, payload);
  return claim === "process";
}
