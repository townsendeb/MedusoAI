import { createClient } from "npm:@supabase/supabase-js@2";
import { hashApiKey } from "./hash.ts";

export type ApiKeyAuthResult =
  | { ok: true; organizationId: string; apiKeyId: string; scopes: string[] }
  | { ok: false; status: number; message: string };

export async function authenticateApiKey(
  request: Request,
  requiredScope?: string,
): Promise<ApiKeyAuthResult> {
  const apiKey =
    request.headers.get("X-Api-Key") ??
    request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!apiKey) {
    return { ok: false, status: 401, message: "Missing API key" };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return { ok: false, status: 500, message: "Server misconfigured" };
  }

  const keyHash = await hashApiKey(apiKey);
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: record, error } = await supabase
    .from("api_keys")
    .select("id, organization_id, scopes, revoked_at")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error || !record) {
    return { ok: false, status: 401, message: "Invalid API key" };
  }

  if (requiredScope && !record.scopes.includes(requiredScope)) {
    return { ok: false, status: 403, message: "Insufficient scope" };
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", record.id);

  return {
    ok: true,
    organizationId: record.organization_id,
    apiKeyId: record.id,
    scopes: record.scopes,
  };
}
