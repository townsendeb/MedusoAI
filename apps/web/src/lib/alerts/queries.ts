import type { Alert, Customer } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export type AlertListItem = Alert & {
  customers: Pick<Customer, "id" | "name" | "phone_e164">;
};

export async function fetchAlerts(): Promise<AlertListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("alerts")
    .select(
      `
      *,
      customers ( id, name, phone_e164 )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AlertListItem[];
}
