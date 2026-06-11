import { DEFAULT_MAX_SMS_TURNS, renderSmsTemplate, sendSms } from "@meduso/shared";
import { inngest } from "../client";
import { checkUsageAllowed, incrementUsage } from "@/lib/billing/usage";
import { isCustomerOptedOut } from "@/lib/outreach/customer";
import { getServiceClient } from "@/lib/supabase/service";

export const sendInitialSms = inngest.createFunction(
  {
    id: "send-initial-sms",
    name: "Send initial SMS",
    triggers: [{ event: "outreach/due" }],
  },
  async ({ event, step }) => {
    const { customerId, organizationId } = event.data as {
      customerId: string;
      organizationId: string;
    };

    const prepared = await step.run("prepare-conversation", async () => {
      const supabase = getServiceClient();

      const [{ data: customer, error: customerError }, { data: settings }, { data: organization }] =
        await Promise.all([
          supabase
            .from("customers")
            .select("id, name, phone_e164, metadata, deleted_at")
            .eq("id", customerId)
            .eq("organization_id", organizationId)
            .maybeSingle(),
          supabase
            .from("outreach_settings")
            .select("sms_template, max_sms_turns")
            .eq("organization_id", organizationId)
            .maybeSingle(),
          supabase.from("organizations").select("name").eq("id", organizationId).single(),
        ]);

      if (customerError) {
        throw customerError;
      }

      if (!customer || customer.deleted_at) {
        return { skip: true as const, reason: "customer_not_found" };
      }

      if (isCustomerOptedOut(customer.metadata as Record<string, unknown>)) {
        return { skip: true as const, reason: "opted_out" };
      }

      const { data: activeConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", customerId)
        .eq("channel", "SMS")
        .eq("status", "IN_PROGRESS")
        .maybeSingle();

      if (activeConversation) {
        return { skip: true as const, reason: "conversation_in_progress" };
      }

      const now = new Date().toISOString();
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          organization_id: organizationId,
          customer_id: customerId,
          channel: "SMS",
          status: "IN_PROGRESS",
          scheduled_at: now,
          started_at: now,
          provider_metadata: { maxSmsTurns: settings?.max_sms_turns ?? DEFAULT_MAX_SMS_TURNS },
        })
        .select("id")
        .single();

      if (conversationError || !conversation) {
        throw conversationError ?? new Error("Failed to create conversation");
      }

      const body = renderSmsTemplate(
        settings?.sms_template ??
          "Hi {{name}}, thanks for visiting {{businessName}}! How was your experience?",
        {
          name: customer.name,
          businessName: organization?.name ?? "our business",
        },
      );

      return {
        skip: false as const,
        conversationId: conversation.id,
        to: customer.phone_e164,
        body,
      };
    });

    if (prepared.skip) {
      return { sent: false, reason: prepared.reason };
    }

    const usage = await step.run("check-sms-usage", async () =>
      checkUsageAllowed(organizationId, "sms_sent"),
    );

    if (!usage.allowed) {
      await step.run("fail-conversation-usage-limit", async () => {
        const supabase = getServiceClient();
        await supabase
          .from("conversations")
          .update({ status: "FAILED", ended_at: new Date().toISOString() })
          .eq("id", prepared.conversationId);
      });

      return { sent: false, reason: usage.reason ?? "usage_limit_exceeded", usage };
    }

    const sms = await step.run("send-sms", async () => sendSms({ to: prepared.to, body: prepared.body }));

    const message = await step.run("persist-message", async () => {
      const supabase = getServiceClient();

      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: prepared.conversationId,
          role: "ASSISTANT",
          content: prepared.body,
          channel: "SMS",
          provider_message_id: sms.sid,
        })
        .select("id")
        .single();

      if (error || !data) {
        throw error ?? new Error("Failed to persist message");
      }

      await supabase
        .from("conversations")
        .update({
          provider_metadata: {
            lastAssistantMessageId: data.id,
            lastSmsSid: sms.sid,
            stub: sms.stub,
          },
        })
        .eq("id", prepared.conversationId);

      return data;
    });

    await step.run("record-sms-usage", async () => incrementUsage(organizationId, "sms_sent"));

    await step.sendEvent("schedule-timeout", {
      name: "conversation/schedule-timeout",
      data: {
        conversationId: prepared.conversationId,
        organizationId,
        lastAssistantMessageId: message.id,
      },
    });

    return {
      sent: true,
      conversationId: prepared.conversationId,
      messageId: message.id,
      stub: sms.stub,
    };
  },
);
