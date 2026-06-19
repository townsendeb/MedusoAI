import type { TelephonyProvider } from "./types";

export function getTelephonyProvider(): TelephonyProvider {
  const value = process.env.TELEPHONY_PROVIDER?.trim().toLowerCase();

  if (value === "legacy" || value === "twilio" || value === "retell") {
    return "legacy";
  }

  return "agentphone";
}

export function isAgentPhoneTelephony(): boolean {
  return getTelephonyProvider() === "agentphone";
}
