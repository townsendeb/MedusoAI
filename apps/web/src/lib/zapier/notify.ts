import { getServiceClient } from "@/lib/supabase/service";

export type ZapierEventType = "alert.created" | "conversation.completed";

export async function dispatchZapierWebhooks(
  organizationId: string,
  eventType: ZapierEventType,
  payload: Record<string, unknown>,
): Promise<void> {
  const supabase = getServiceClient();

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
