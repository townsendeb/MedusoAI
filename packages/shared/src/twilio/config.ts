import type { TwilioConfig } from "./types";

export function isTwilioConfigured(config?: Partial<TwilioConfig>): config is TwilioConfig {
  const accountSid = config?.accountSid ?? process.env.TWILIO_ACCOUNT_SID;
  const authToken = config?.authToken ?? process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = config?.phoneNumber ?? process.env.TWILIO_PHONE_NUMBER;

  return Boolean(accountSid && authToken && phoneNumber);
}

export function getTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    return null;
  }

  return { accountSid, authToken, phoneNumber };
}
