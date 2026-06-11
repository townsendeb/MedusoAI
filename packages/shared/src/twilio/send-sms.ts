import { getTwilioConfig } from "./config";
import type { SendSmsInput, SendSmsResult, TwilioConfig } from "./types";

export async function sendSms(
  input: SendSmsInput,
  config?: TwilioConfig | null,
): Promise<SendSmsResult> {
  const twilio = config ?? getTwilioConfig();

  if (!twilio) {
    console.info("[twilio:stub] SMS not sent — credentials not configured", {
      to: input.to,
      bodyLength: input.body.length,
    });

    return {
      sid: `SM_STUB_${crypto.randomUUID()}`,
      status: "queued",
      stub: true,
    };
  }

  const from = input.from ?? twilio.phoneNumber;
  const body = new URLSearchParams({
    To: input.to,
    From: from,
    Body: input.body,
  });

  const credentials = btoa(`${twilio.accountSid}:${twilio.authToken}`);
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
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

  return {
    sid: payload.sid,
    status: payload.status,
    stub: false,
  };
}
