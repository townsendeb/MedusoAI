import { createClient } from "@/lib/supabase/client";

export type AnalyticsOverview = {
  customersContacted: number;
  conversationsCompleted: number;
  recoveryOpportunities: number;
  customersRecovered: number;
  revenueProtected: number;
};

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_analytics_overview");

  if (error) {
    throw error;
  }

  const overview = data as AnalyticsOverview | null;

  return {
    customersContacted: overview?.customersContacted ?? 0,
    conversationsCompleted: overview?.conversationsCompleted ?? 0,
    recoveryOpportunities: overview?.recoveryOpportunities ?? 0,
    customersRecovered: overview?.customersRecovered ?? 0,
    revenueProtected: overview?.revenueProtected ?? 0,
  };
}
