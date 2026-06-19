import type { CreateAgentPhoneCallResult, SendAgentPhoneMessageResult } from "./types";

export function stubSendMessage(to: string, body: string): SendAgentPhoneMessageResult {
  console.info("[agentphone:stub] SMS not sent — credentials not configured", {
    to,
    bodyLength: body.length,
  });

  return {
    providerMessageId: `msg_stub_${crypto.randomUUID()}`,
    status: "queued",
    stub: true,
  };
}

export function stubCreateCall(): CreateAgentPhoneCallResult {
  console.info("[agentphone:stub] Outbound call not placed — AgentPhone credentials not configured");

  return {
    callId: `call_stub_${crypto.randomUUID()}`,
    stub: true,
  };
}
