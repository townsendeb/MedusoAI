import { getUserProfile } from "@/lib/profile";
import { CustomersPageContent } from "@/components/customers/customers-page-content";

export default async function CustomersPage() {
  const profile = await getUserProfile();

  return <CustomersPageContent organizationId={profile!.organization_id} />;
}
