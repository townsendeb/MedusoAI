import Link from "next/link";
import { redirect } from "next/navigation";
import { MEDUSO_APP_NAME } from "@meduso/shared";
import { Button } from "@/components/ui/button";
import { getAuthUser, getUserProfile } from "@/lib/profile";

export default async function Home() {
  const user = await getAuthUser();

  if (user) {
    const profile = await getUserProfile();
    redirect(profile ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <main className="flex max-w-lg flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{MEDUSO_APP_NAME}</h1>
        <p className="text-muted-foreground">
          Identify unhappy customers before they leave — and help you recover them.
        </p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button>Sign in</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
