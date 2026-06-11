import { createClient } from "@/lib/supabase/server";
import type { BillingSummary } from "./types";

export type { BillingSummary } from "./types";
export { isNearLimit, usagePercent } from "./types";

export async function getBillingSummary(): Promise<BillingSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_billing_summary");

  if (error) {
    console.error("get_billing_summary failed:", error);
    return null;
  }

  return data as BillingSummary;
}
