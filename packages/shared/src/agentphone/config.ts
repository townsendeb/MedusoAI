import type { AgentPhoneConfig } from "./types";

export function isAgentPhoneConfigured(config?: Partial<AgentPhoneConfig>): config is AgentPhoneConfig {
  const apiKey = config?.apiKey ?? process.env.AGENTPHONE_API_KEY;
  const agentId = config?.agentId ?? process.env.AGENTPHONE_AGENT_ID;

  return Boolean(apiKey && agentId);
}

export function getAgentPhoneConfig(): AgentPhoneConfig | null {
  const apiKey = process.env.AGENTPHONE_API_KEY;
  const agentId = process.env.AGENTPHONE_AGENT_ID;
  const numberId = process.env.AGENTPHONE_NUMBER_ID;

  if (!apiKey || !agentId) {
    return null;
  }

  return {
    apiKey,
    agentId,
    numberId: numberId || undefined,
  };
}
