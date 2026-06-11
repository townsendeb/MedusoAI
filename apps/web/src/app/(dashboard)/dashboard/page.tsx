import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { UsageLimitBanner } from "@/components/dashboard/usage-limit-banner";
import { getBillingSummary } from "@/lib/billing/summary";
import { getUserProfile } from "@/lib/profile";

export default async function DashboardPage() {
  const [profile, billing] = await Promise.all([getUserProfile(), getBillingSummary()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{profile ? `, ${profile.name}` : ""}. Your recovery command center.
        </p>
      </div>
      {billing ? <UsageLimitBanner summary={billing} /> : null}
      <DashboardOverview organizationId={profile!.organization_id} />
    </div>
  );
}
