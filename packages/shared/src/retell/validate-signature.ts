async function computeHmacSha256Hex(data: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index++) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

/** Verify Retell `X-Retell-Signature` header (v={timestamp},d={digest}). */
export async function validateRetellSignature(
  rawBody: string,
  apiKey: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) {
    return false;
  }

  const match = signature.match(/v=(\d+),d=(.*)/);
  if (!match) {
    return false;
  }

  const timestamp = match[1];
  const digest = match[2];

  const now = Date.now();
  if (Math.abs(now - Number.parseInt(timestamp, 10)) > 5 * 60 * 1000) {
    return false;
  }

  const expected = await computeHmacSha256Hex(rawBody + timestamp, apiKey);
  return timingSafeEqualHex(expected, digest);
}
