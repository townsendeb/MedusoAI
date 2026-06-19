import {
  buildVoiceInitialGreeting,
  buildVoiceSystemPrompt,
  createAgentPhoneCall,
} from "../agentphone";
import { createPhoneCall } from "../retell/create-phone-call";
import { getTelephonyProvider } from "./provider";
import type { OutboundCallResult, PlaceOutboundCallInput } from "./types";

export async function placeOutboundCall(input: PlaceOutboundCallInput): Promise<OutboundCallResult> {
  if (getTelephonyProvider() === "legacy") {
    return createPhoneCall({
      toNumber: input.toNumber,
      metadata: input.metadata,
      dynamicVariables: {
        name: input.customerName,
      },
    });
  }

  return createAgentPhoneCall({
    toNumber: input.toNumber,
    systemPrompt: buildVoiceSystemPrompt({
      businessName: input.businessName,
      customerName: input.customerName,
    }),
    initialGreeting: buildVoiceInitialGreeting({
      businessName: input.businessName,
      customerName: input.customerName,
    }),
    metadata: input.metadata,
  });
}
