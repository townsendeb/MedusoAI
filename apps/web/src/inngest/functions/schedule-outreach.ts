import { DEFAULT_SMS_DELAY_HOURS } from "@meduso/shared";
import { inngest } from "../client";
import { getOutreachDelayDuration } from "@/lib/outreach/delay";
import { isCustomerOptedOut } from "@/lib/outreach/customer";
import { getServiceClient } from "@/lib/supabase/service";

export const scheduleOutreach = inngest.createFunction(
  {
    id: "schedule-outreach",
    name: "Schedule outreach",
    triggers: [{ event: "customer/created" }],
  },
  async ({ event, step }) => {
    const { customerId, organizationId } = event.data as {
      customerId: string;
      organizationId: string;
    };

    const context = await step.run("load-context", async () => {
      const supabase = getServiceClient();

      const [{ data: customer, error: customerError }, { data: settings, error: settingsError }] =
        await Promise.all([
          supabase
            .from("customers")
            .select("id, metadata, deleted_at")
            .eq("id", customerId)
            .eq("organization_id", organizationId)
            .maybeSingle(),
          supabase
            .from("outreach_settings")
            .select("sms_delay_hours")
            .eq("organization_id", organizationId)
            .maybeSingle(),
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

      if (settingsError) {
        throw settingsError;
      }

      const delayHours = settings?.sms_delay_hours ?? DEFAULT_SMS_DELAY_HOURS;

      return { skip: false as const, delayHours };
    });

    if (context.skip) {
      return { scheduled: false, reason: context.reason };
    }

    await step.sleep("outreach-delay", getOutreachDelayDuration(context.delayHours));

    await step.sendEvent("outreach-due", {
      name: "outreach/due",
      data: { customerId, organizationId },
    });

    return { scheduled: true, customerId, organizationId };
  },
);
