export async function sendAgentPhoneMessage(input: {
  to: string;
  body: string;
  agentId?: string;
  numberId?: string;
}): Promise<{ providerMessageId: string; status: string; stub: boolean }> {
  const apiKey = Deno.env.get("AGENTPHONE_API_KEY");
  const agentId = Deno.env.get("AGENTPHONE_AGENT_ID");
  const defaultNumberId = Deno.env.get("AGENTPHONE_NUMBER_ID");

  if (!apiKey || !agentId) {
    console.info("[agentphone:stub] SMS not sent — credentials not configured");
    return {
      providerMessageId: `msg_stub_${crypto.randomUUID()}`,
      status: "queued",
      stub: true,
    };
  }

  const body: Record<string, string> = {
    agent_id: input.agentId ?? agentId,
    to_number: input.to,
    body: input.body,
  };

  const numberId = input.numberId ?? defaultNumberId;
  if (numberId) {
    body.number_id = numberId;
  }

  const response = await fetch("https://api.agentphone.ai/v1/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AgentPhone send message failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as { id?: string; status?: string };

  return {
    providerMessageId: payload.id ?? `msg_${crypto.randomUUID()}`,
    status: payload.status ?? "sent",
    stub: false,
  };
}

function hexFromBuffer(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

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
  if (ageSeconds > 300) {
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

export type AgentPhoneWebhookAuthResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

/** Fail closed when AGENTPHONE_WEBHOOK_SECRET is configured. */
export async function verifyAgentPhoneWebhookRequest(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
): Promise<AgentPhoneWebhookAuthResult> {
  const webhookSecret = Deno.env.get("AGENTPHONE_WEBHOOK_SECRET");

  if (!webhookSecret) {
    return { ok: true };
  }

  if (!signature || !timestamp) {
    return { ok: false, status: 403, message: "Missing AgentPhone webhook signature headers" };
  }

  const valid = await validateAgentPhoneWebhook(rawBody, signature, timestamp, webhookSecret);
  if (!valid) {
    return { ok: false, status: 403, message: "Invalid AgentPhone signature" };
  }

  return { ok: true };
}
