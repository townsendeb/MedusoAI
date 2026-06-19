const REPLAY_WINDOW_SECONDS = 300;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index++) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

function hexFromBuffer(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Validate AgentPhone webhook HMAC-SHA256 (`X-Webhook-Signature`). */
export async function validateAgentPhoneWebhook(
  rawBody: string,
  signature: string,
  timestamp: string,
  secret: string,
): Promise<boolean> {
  const timestampSeconds = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - timestampSeconds);
  if (ageSeconds > REPLAY_WINDOW_SECONDS) {
    return false;
  }

  const signedString = `${timestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedString));
  const expected = `sha256=${hexFromBuffer(digest)}`;

  return timingSafeEqual(signature, expected);
}
