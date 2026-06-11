import { createClient } from "npm:@supabase/supabase-js@2";

export type UsageMetric = "sms_sent" | "voice_minutes" | "customers_imported";

export type UsageCheckResult = {
  allowed: boolean;
  reason?: string;
  metric?: string;
  current?: number;
  limit?: number | null;
  plan?: string;
  status?: string;
};

function getServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase service credentials are not configured");
  }

  return createClient(supabaseUrl, serviceKey);
}

export async function checkUsageAllowed(
  organizationId: string,
  metric: UsageMetric,
  amount = 1,
): Promise<UsageCheckResult> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("check_usage_allowed", {
    p_organization_id: organizationId,
    p_metric: metric,
    p_amount: amount,
  });

  if (error) {
    throw error;
  }

  return data as UsageCheckResult;
}

export async function incrementUsage(
  organizationId: string,
  metric: UsageMetric,
  amount = 1,
): Promise<UsageCheckResult> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("increment_usage", {
    p_organization_id: organizationId,
    p_metric: metric,
    p_amount: amount,
  });

  if (error) {
    throw error;
  }

  return data as UsageCheckResult;
}

/** @deprecated Prefer checkUsageAllowed + incrementUsage */
export async function tryConsumeUsage(
  organizationId: string,
  metric: UsageMetric,
  amount = 1,
): Promise<UsageCheckResult> {
  return incrementUsage(organizationId, metric, amount);
}
