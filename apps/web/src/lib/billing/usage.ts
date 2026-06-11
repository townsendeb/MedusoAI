import type { UsageMetric } from "@meduso/shared";
import { getServiceClient } from "@/lib/supabase/service";

export type UsageCheckResult = {
  allowed: boolean;
  reason?: string;
  metric?: string;
  current?: number;
  limit?: number | null;
  plan?: string;
  status?: string;
};

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
