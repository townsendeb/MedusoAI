import { hashApiKey } from "./hash";

const API_KEY_PREFIX = "med_";

export function generateApiKeyRaw(): string {
  const partA = crypto.randomUUID().replace(/-/g, "");
  const partB = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `${API_KEY_PREFIX}${partA}${partB}`;
}

export function getApiKeyDisplayPrefix(rawKey: string): string {
  return rawKey.slice(0, 8);
}

export async function generateApiKeyMaterial(): Promise<{
  rawKey: string;
  keyPrefix: string;
  keyHash: string;
}> {
  const rawKey = generateApiKeyRaw();
  const keyPrefix = getApiKeyDisplayPrefix(rawKey);
  const keyHash = await hashApiKey(rawKey);
  return { rawKey, keyPrefix, keyHash };
}
