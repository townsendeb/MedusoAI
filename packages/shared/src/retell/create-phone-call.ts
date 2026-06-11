import { getRetellConfig } from "./config";
import type { CreatePhoneCallInput, CreatePhoneCallResult, RetellConfig } from "./types";

export async function createPhoneCall(
  input: CreatePhoneCallInput,
  config?: RetellConfig | null,
): Promise<CreatePhoneCallResult> {
  const retell = config ?? getRetellConfig();

  if (!retell) {
    console.info("[retell:stub] Outbound call not placed — Retell/Twilio credentials not configured");
    return {
      callId: `call_stub_${crypto.randomUUID()}`,
      stub: true,
    };
  }

  const body: Record<string, unknown> = {
    from_number: input.fromNumber ?? retell.fromNumber,
    to_number: input.toNumber,
    override_agent_id: input.agentId ?? retell.agentId,
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
      Authorization: `Bearer ${retell.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Retell create-phone-call failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as { call_id: string };

  return {
    callId: payload.call_id,
    stub: false,
  };
}
