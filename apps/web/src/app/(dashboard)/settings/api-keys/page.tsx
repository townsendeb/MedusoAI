import { ApiKeysManager } from "@/components/settings/api-keys-manager";
import { getUserProfile } from "@/lib/profile";

export default async function ApiKeysSettingsPage() {
  const profile = await getUserProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
        <p className="text-muted-foreground">
          Manage integration keys for Zapier and external systems. See{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">integrations/zapier</code>{" "}
          to publish the Zapier app.
        </p>
      </div>
      <ApiKeysManager organizationId={profile!.organization_id} />
    </div>
  );
}
