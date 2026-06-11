import type { ApiKeyScope } from "../enums";
import { hashApiKey } from "./hash";

export type ApiKeyRecord = {
  id: string;
  organization_id: string;
  key_hash: string;
  scopes: string[];
  revoked_at: string | null;
};

/** Returns the matching key record when the provided secret is valid. */
export async function verifyApiKeySecret(
  secret: string,
  keys: ApiKeyRecord[],
): Promise<ApiKeyRecord | null> {
  const digest = await hashApiKey(secret);
  return keys.find((key) => !key.revoked_at && key.key_hash === digest) ?? null;
}

export function apiKeyHasScope(key: ApiKeyRecord, scope: ApiKeyScope): boolean {
  return key.scopes.includes(scope);
}
