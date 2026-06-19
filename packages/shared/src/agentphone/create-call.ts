import { getAgentPhoneConfig } from "./config";
import { stubCreateCall } from "./stub";
import type {
  AgentPhoneConfig,
  CreateAgentPhoneCallInput,
  CreateAgentPhoneCallResult,
} from "./types";

const API_BASE = "https://api.agentphone.ai/v1";

export async function createAgentPhoneCall(
  input: CreateAgentPhoneCallInput,
  config?: AgentPhoneConfig | null,
): Promise<CreateAgentPhoneCallResult> {
  const agentPhone = config ?? getAgentPhoneConfig();

  if (!agentPhone) {
    return stubCreateCall();
  }

  const body: Record<string, unknown> = {
    agentId: input.agentId ?? agentPhone.agentId,
    toNumber: input.toNumber,
    systemPrompt: input.systemPrompt,
  };

  if (input.initialGreeting) {
    body.initialGreeting = input.initialGreeting;
  }

  const fromNumberId = input.fromNumberId ?? agentPhone.numberId;
  if (fromNumberId) {
    body.fromNumberId = fromNumberId;
  }

  if (input.metadata) {
    body.metadata = input.metadata;
  }

  const response = await fetch(`${API_BASE}/calls`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${agentPhone.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AgentPhone create call failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as { id?: string };

  return {
    callId: payload.id ?? `call_${crypto.randomUUID()}`,
    stub: false,
  };
}
