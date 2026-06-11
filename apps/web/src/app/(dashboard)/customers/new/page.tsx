import { CreateCustomerPage } from "@/components/customers/create-customer-page";
import { getUserProfile } from "@/lib/profile";

export default async function NewCustomerPage() {
  const profile = await getUserProfile();

  return <CreateCustomerPage organizationId={profile!.organization_id} />;
}
