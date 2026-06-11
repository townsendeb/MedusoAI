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
  if (expected.length !== digest.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < expected.length; index++) {
    mismatch |= expected.charCodeAt(index) ^ digest.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function createPhoneCall(input: {
  toNumber: string;
  fromNumber: string;
  agentId: string;
  apiKey: string;
  metadata?: Record<string, string>;
  dynamicVariables?: Record<string, string>;
}): Promise<{ callId: string; stub: boolean }> {
  const body: Record<string, unknown> = {
    from_number: input.fromNumber,
    to_number: input.toNumber,
    override_agent_id: input.agentId,
  };

  if (input.metadata) {
    body.metadata = input.metadata;
  }

  if (input.dynamicVariables) {
    body.retell_llm_dynamic_variables = input.dynamicVariables;
  }

  const response = await fetch("https://api.retellai.com/v2/create-phone-call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Retell create-phone-call failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as { call_id: string };
  return { callId: payload.call_id, stub: false };
}
