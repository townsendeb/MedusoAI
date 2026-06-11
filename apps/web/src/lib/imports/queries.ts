import type { CustomerImport } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export async function fetchCustomerImport(importId: string): Promise<CustomerImport> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customer_imports")
    .select("*")
    .eq("id", importId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchProcessingCustomerImport(
  organizationId: string,
): Promise<CustomerImport | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customer_imports")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "PROCESSING")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
