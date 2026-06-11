import type { CreateApiKeyInput } from "@meduso/shared";
import { generateApiKeyMaterial } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export async function createApiKey(organizationId: string, input: CreateApiKeyInput) {
  const { rawKey, keyPrefix, keyHash } = await generateApiKeyMaterial();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      organization_id: organizationId,
      name: input.name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      scopes: input.scopes,
    })
    .select("id, name, key_prefix, scopes, created_at")
    .single();

  if (error) {
    throw error;
  }

  return { ...data, rawKey };
}

export async function revokeApiKey(apiKeyId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", apiKeyId)
    .is("revoked_at", null);

  if (error) {
    throw error;
  }
}
