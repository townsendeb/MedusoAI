import Link from "next/link";
import { redirect } from "next/navigation";
import { MEDUSO_APP_NAME } from "@meduso/shared";
import { DashboardProviders } from "@/components/providers/dashboard-providers";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/profile";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold tracking-tight">
              {MEDUSO_APP_NAME}
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/customers" className="hover:text-foreground">
                Customers
              </Link>
              <Link href="/conversations" className="hover:text-foreground">
                Conversations
              </Link>
              <Link href="/alerts" className="hover:text-foreground">
                Alerts
              </Link>
              <Link href="/analytics" className="hover:text-foreground">
                Analytics
              </Link>
              <Link href="/settings/billing" className="hover:text-foreground">
                Billing
              </Link>
              <Link href="/settings/api-keys" className="hover:text-foreground">
                API keys
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">
              {profile.organizations.name}
            </span>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <DashboardProviders>{children}</DashboardProviders>
      </main>
    </div>
  );
}
