import { AlertsInbox } from "@/components/alerts/alerts-inbox";
import { getUserProfile } from "@/lib/profile";

export default async function AlertsPage() {
  const profile = await getUserProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">
          At-risk customers surfaced from AI conversation analysis.
        </p>
      </div>
      <AlertsInbox organizationId={profile!.organization_id} />
    </div>
  );
}
