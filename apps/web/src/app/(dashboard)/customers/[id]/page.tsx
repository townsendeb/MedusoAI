import { CustomerDetail } from "@/components/customers/customer-detail";
import { getUserProfile } from "@/lib/profile";

type CustomerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { id } = await params;
  const profile = await getUserProfile();

  return <CustomerDetail organizationId={profile!.organization_id} customerId={id} />;
}
