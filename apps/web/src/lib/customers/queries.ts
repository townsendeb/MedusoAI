import type { Conversation, Customer } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export type CustomerListItem = Customer;

export type CustomerDetail = Customer & {
  conversations: Pick<
    Conversation,
    "id" | "status" | "channel" | "recovery_status" | "created_at" | "started_at" | "ended_at"
  >[];
};

export async function fetchCustomers(): Promise<CustomerListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchCustomer(customerId: string): Promise<CustomerDetail> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      *,
      conversations (
        id,
        status,
        channel,
        recovery_status,
        created_at,
        started_at,
        ended_at
      )
    `,
    )
    .eq("id", customerId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw error;
  }

  const conversations = [...(data.conversations ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    ...data,
    conversations,
  };
}
