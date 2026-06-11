import type { SubscriptionPlan, SubscriptionStatus } from "@meduso/shared";

export type BillingSummary = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  period: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  usage: {
    sms_sent: number;
    voice_minutes: number;
    customers_imported: number;
  };
  limits: {
    sms_sent: number | null;
    voice_minutes: number | null;
    customers_imported: number | null;
  };
};

export function usagePercent(used: number, limit: number | null): number | null {
  if (limit === null || limit === 0) {
    return null;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

export function isNearLimit(used: number, limit: number | null, threshold = 0.8): boolean {
  if (limit === null || limit === 0) {
    return false;
  }

  return used / limit >= threshold;
}
