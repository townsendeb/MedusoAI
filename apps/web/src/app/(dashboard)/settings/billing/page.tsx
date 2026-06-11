import { revalidatePath } from "next/cache";
import { BillingManager } from "@/components/settings/billing-manager";
import { getBillingSummary } from "@/lib/billing/summary";

type BillingPageProps = {
  searchParams: Promise<{ checkout?: string }>;
};

export default async function BillingSettingsPage({ searchParams }: BillingPageProps) {
  const { checkout } = await searchParams;

  if (checkout === "success") {
    revalidatePath("/settings/billing");
    revalidatePath("/dashboard");
  }

  const summary = await getBillingSummary();

  if (!summary) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Unable to load billing details. Try again shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription, view usage, and upgrade when you need more outreach capacity.
        </p>
      </div>
      <BillingManager summary={summary} checkoutStatus={checkout ?? null} />
    </div>
  );
}
