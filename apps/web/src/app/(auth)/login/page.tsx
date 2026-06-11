import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Access your Meduso AI dashboard"
      footer={
        <span className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Register
          </Link>
        </span>
      }
    >
      <div className="space-y-4">
        <Suspense fallback={null}>
          <AuthErrorBanner />
        </Suspense>
        <GoogleAuthButton label="Continue with Google" />
        <AuthDivider />
        <LoginForm />
      </div>
    </AuthCard>
  );
}
