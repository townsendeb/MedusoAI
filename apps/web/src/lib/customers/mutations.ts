import type { CreateCustomerInput, UpdateCustomerInput } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";
import { normalizePhoneE164 } from "@/lib/format";

function mapCreateInput(organizationId: string, input: CreateCustomerInput) {
  const metadata = {
    ...(input.metadata ?? {}),
    ...(input.location ? { location: input.location } : {}),
  };

  return {
    organization_id: organizationId,
    name: input.name,
    phone_e164: normalizePhoneE164(input.phone),
    email: input.email ?? null,
    last_visit_date: input.visitDate ?? null,
    external_id: input.externalId ?? null,
    metadata,
    source: "MANUAL" as const,
  };
}

export async function createCustomer(organizationId: string, input: CreateCustomerInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert(mapCreateInput(organizationId, input))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCustomer(
  customerId: string,
  input: UpdateCustomerInput,
  existingMetadata: Record<string, unknown> = {},
) {
  const supabase = createClient();
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.phone !== undefined) payload.phone_e164 = normalizePhoneE164(input.phone);
  if (input.email !== undefined) payload.email = input.email;
  if (input.visitDate !== undefined) payload.last_visit_date = input.visitDate;
  if (input.externalId !== undefined) payload.external_id = input.externalId;
  if (input.location !== undefined) {
    payload.metadata = { ...existingMetadata, location: input.location };
  }

  const { data, error } = await supabase
    .from("customers")
    .update(payload)
    .eq("id", customerId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCustomer(customerId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", customerId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}
