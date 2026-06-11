import type { SubscriptionPlan } from "../enums";

// Keep in sync with supabase/migrations plan_limit_config seed data.
export type UsageMetric = "sms_sent" | "voice_minutes" | "customers_imported";

export type PlanLimits = {
  sms_sent: number | null;
  voice_minutes: number | null;
  customers_imported: number | null;
};

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: { sms_sent: 50, voice_minutes: 0, customers_imported: 100 },
  STARTER: { sms_sent: 500, voice_minutes: 60, customers_imported: 1000 },
  GROWTH: { sms_sent: 2000, voice_minutes: 300, customers_imported: 5000 },
  ENTERPRISE: { sms_sent: null, voice_minutes: null, customers_imported: null },
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE: "Free",
  STARTER: "Starter",
  GROWTH: "Growth",
  ENTERPRISE: "Enterprise",
};

export const UPGRADEABLE_PLANS: SubscriptionPlan[] = ["STARTER", "GROWTH"];

export function getPlanLimit(plan: SubscriptionPlan, metric: UsageMetric): number | null {
  return PLAN_LIMITS[plan][metric];
}

export function isUsageUnlimited(limit: number | null): boolean {
  return limit === null;
}
