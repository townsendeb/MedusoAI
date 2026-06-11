import { CategoryTrends } from "@/components/analytics/category-trends";
import { getUserProfile } from "@/lib/profile";

export default async function AnalyticsPage() {
  const profile = await getUserProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Complaint and praise trends from analyzed customer conversations.
        </p>
      </div>
      <CategoryTrends organizationId={profile!.organization_id} />
    </div>
  );
}
