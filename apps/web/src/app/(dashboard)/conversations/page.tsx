import { ConversationsList } from "@/components/conversations/conversations-list";
import { getUserProfile } from "@/lib/profile";

export default async function ConversationsPage() {
  const profile = await getUserProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conversations</h1>
        <p className="text-muted-foreground">
          SMS outreach threads with your customers after their visits.
        </p>
      </div>
      <ConversationsList organizationId={profile!.organization_id} />
    </div>
  );
}
