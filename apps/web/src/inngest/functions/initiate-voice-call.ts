import { placeOutboundCall } from "@meduso/shared";
import { inngest } from "../client";
import { checkUsageAllowed, incrementUsage } from "@/lib/billing/usage";
import { emitConversationEnded } from "@/lib/inngest/events";
import { isCustomerOptedOut } from "@/lib/outreach/customer";
import { getServiceClient } from "@/lib/supabase/service";

export const initiateVoiceCall = inngest.createFunction(
  {
    id: "initiate-voice-call",
    name: "Initiate voice call",
    triggers: [{ event: "voice/call.requested" }],
  },
  async ({ event, step }) => {
    const { customerId, organizationId } = event.data as {
      customerId: string;
      organizationId: string;
    };

    const prepared = await step.run("prepare-voice-conversation", async () => {
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
            .select("voice_enabled")
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

      if (settings && !settings.voice_enabled) {
        return { skip: true as const, reason: "voice_disabled" };
      }

      const { data: activeVoice } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", customerId)
        .eq("channel", "VOICE")
        .eq("status", "IN_PROGRESS")
        .maybeSingle();

      if (activeVoice) {
        return { skip: true as const, reason: "call_in_progress" };
      }

      const usage = await checkUsageAllowed(organizationId, "voice_minutes");
      if (!usage.allowed) {
        return { skip: true as const, reason: usage.reason ?? "usage_limit_exceeded", usage };
      }

      const now = new Date().toISOString();
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          organization_id: organizationId,
          customer_id: customerId,
          channel: "VOICE",
          status: "IN_PROGRESS",
          scheduled_at: now,
          started_at: now,
        })
        .select("id")
        .single();

      if (conversationError || !conversation) {
        throw conversationError ?? new Error("Failed to create voice conversation");
      }

      return {
        skip: false as const,
        conversationId: conversation.id,
        customerName: customer.name,
        businessName: organization?.name ?? "our business",
        phoneE164: customer.phone_e164,
      };
    });

    if (prepared.skip) {
      return { placed: false, reason: prepared.reason };
    }

    const call = await step.run("place-and-link-voice-call", async () => {
      const placed = await placeOutboundCall({
        toNumber: prepared.phoneE164,
        businessName: prepared.businessName,
        customerName: prepared.customerName,
        metadata: {
          conversationId: prepared.conversationId,
          organizationId,
          customerId,
        },
      });

      const supabase = getServiceClient();
      const { error } = await supabase
        .from("conversations")
        .update({
          provider_call_id: placed.callId,
          provider_metadata: { stub: placed.stub },
        })
        .eq("id", prepared.conversationId);

      if (error) {
        throw error;
      }

      return placed;
    });

    await step.run("record-voice-usage", async () => incrementUsage(organizationId, "voice_minutes"));

    if (call.stub) {
      await step.sleep("stub-call-duration", "5s");

      await step.run("complete-stub-call", async () => {
        const supabase = getServiceClient();
        const endedAt = new Date().toISOString();
        const transcript = `Assistant: Hi ${prepared.customerName}, thanks for visiting us today. How was your experience?\nCustomer: It was fine overall.`;

        await supabase
          .from("conversations")
          .update({
            status: "COMPLETED",
            ended_at: endedAt,
            transcript_raw: transcript,
          })
          .eq("id", prepared.conversationId);

        await supabase.from("messages").insert([
          {
            conversation_id: prepared.conversationId,
            role: "ASSISTANT",
            content: `Hi ${prepared.customerName}, thanks for visiting us today. How was your experience?`,
            channel: "VOICE",
          },
          {
            conversation_id: prepared.conversationId,
            role: "CUSTOMER",
            content: "It was fine overall.",
            channel: "VOICE",
          },
        ]);

        await emitConversationEnded({
          conversationId: prepared.conversationId,
          organizationId,
          reason: "manual",
        });
      });
    }

    return {
      placed: true,
      conversationId: prepared.conversationId,
      callId: call.callId,
      stub: call.stub,
    };
  },
);
