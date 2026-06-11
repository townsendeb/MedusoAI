import type { ApiKey } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export type ApiKeyListItem = Pick<
  ApiKey,
  "id" | "name" | "key_prefix" | "scopes" | "last_used_at" | "revoked_at" | "created_at"
>;

export async function fetchApiKeys(): Promise<ApiKeyListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
