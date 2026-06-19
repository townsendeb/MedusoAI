import { getAgentPhoneConfig } from "./config";
import { stubSendMessage } from "./stub";
import type {
  AgentPhoneConfig,
  SendAgentPhoneMessageInput,
  SendAgentPhoneMessageResult,
} from "./types";

const API_BASE = "https://api.agentphone.ai/v1";

export async function sendAgentPhoneMessage(
  input: SendAgentPhoneMessageInput,
  config?: AgentPhoneConfig | null,
): Promise<SendAgentPhoneMessageResult> {
  const agentPhone = config ?? getAgentPhoneConfig();

  if (!agentPhone) {
    return stubSendMessage(input.to, input.body);
  }

  const body: Record<string, string> = {
    agent_id: input.agentId ?? agentPhone.agentId,
    to_number: input.to,
    body: input.body,
  };

  const numberId = input.numberId ?? agentPhone.numberId;
  if (numberId) {
    body.number_id = numberId;
  }

  const response = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${agentPhone.apiKey}`,
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
