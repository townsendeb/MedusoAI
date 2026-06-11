import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getAuthUser, getUserProfile } from "@/lib/profile";

export default async function OnboardingPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();
  if (profile) {
    redirect("/dashboard");
  }

  const defaultName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";

  return (
    <AuthCard
      title="Set up your business"
      description="Tell us about your business to get started with Meduso AI"
    >
      <OnboardingForm defaultName={defaultName} />
    </AuthCard>
  );
}
