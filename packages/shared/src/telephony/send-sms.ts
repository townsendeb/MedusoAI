import { sendAgentPhoneMessage } from "../agentphone/send-message";
import { sendSms } from "../twilio/send-sms";
import { getTelephonyProvider } from "./provider";
import type { OutboundSmsResult } from "./types";

export type SendOutboundSmsInput = {
  to: string;
  body: string;
};

export async function sendOutboundSms(input: SendOutboundSmsInput): Promise<OutboundSmsResult> {
  if (getTelephonyProvider() === "legacy") {
    const result = await sendSms(input);
    return {
      providerMessageId: result.sid,
      status: result.status,
      stub: result.stub,
    };
  }

  return sendAgentPhoneMessage(input);
}
