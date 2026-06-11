function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export async function validateTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>,
): Promise<boolean> {
  const sortedKeys = Object.keys(params).sort();
  const data = sortedKeys.reduce((acc, key) => acc + key + params[key], url);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return signature === toBase64(digest);
}

export async function sendSms(input: {
  to: string;
  body: string;
  from?: string;
}): Promise<{ sid: string; status: string; stub: boolean }> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const phoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !phoneNumber) {
    console.info("[twilio:stub] SMS not sent — credentials not configured");
    return {
      sid: `SM_STUB_${crypto.randomUUID()}`,
      status: "queued",
      stub: true,
    };
  }

  const from = input.from ?? phoneNumber;
  const body = new URLSearchParams({
    To: input.to,
    From: from,
    Body: input.body,
  });

  const credentials = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio send failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as { sid: string; status: string };
  return { sid: payload.sid, status: payload.status, stub: false };
}
