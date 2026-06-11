import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start identifying at-risk customers before they churn"
      footer={
        <span className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <div className="space-y-4">
        <GoogleAuthButton label="Sign up with Google" />
        <AuthDivider />
        <RegisterForm />
      </div>
    </AuthCard>
  );
}
