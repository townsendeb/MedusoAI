import { inngest } from "@/inngest/client";

export async function emitCustomerCreated(data: {
  customerId: string;
  organizationId: string;
}): Promise<void> {
  await inngest.send({
    name: "customer/created",
    data,
    id: `customer-${data.customerId}-outreach`,
  });
}

export async function emitConversationEnded(data: {
  conversationId: string;
  organizationId: string;
  reason: "timeout" | "max_turns" | "opt_out" | "manual";
}): Promise<void> {
  await inngest.send({
    name: "conversation/ended",
    data,
    id: `conversation-ended-${data.conversationId}-${data.reason}`,
  });
}
