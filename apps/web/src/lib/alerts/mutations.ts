import type { AlertStatus } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export async function updateAlertStatus(alertId: string, status: AlertStatus) {
  const supabase = createClient();
  const payload: Record<string, unknown> = { status };

  if (status === "ACKNOWLEDGED" || status === "RESOLVED") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      payload.acknowledged_by_user_id = user.id;
      payload.acknowledged_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("alerts")
    .update(payload)
    .eq("id", alertId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
