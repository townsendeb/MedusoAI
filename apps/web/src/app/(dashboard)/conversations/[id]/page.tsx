import { ConversationDetail } from "@/components/conversations/conversation-detail";
import { getUserProfile } from "@/lib/profile";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  const profile = await getUserProfile();

  return (
    <ConversationDetail organizationId={profile!.organization_id} conversationId={id} />
  );
}
