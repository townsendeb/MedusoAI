import type { RetellConfig } from "./types";

export function isRetellConfigured(config?: Partial<RetellConfig>): config is RetellConfig {
  const apiKey = config?.apiKey ?? process.env.RETELL_API_KEY;
  const agentId = config?.agentId ?? process.env.RETELL_AGENT_ID;
  const fromNumber = config?.fromNumber ?? process.env.TWILIO_PHONE_NUMBER;

  return Boolean(apiKey && agentId && fromNumber);
}

export function getRetellConfig(): RetellConfig | null {
  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_AGENT_ID;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!apiKey || !agentId || !fromNumber) {
    return null;
  }

  return { apiKey, agentId, fromNumber };
}
