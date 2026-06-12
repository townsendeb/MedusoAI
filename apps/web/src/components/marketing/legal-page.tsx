import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/marketing/config";
import { MarketingFooter } from "./marketing-footer";
import { MarketingNav } from "./marketing-nav";
import { MarketingContainer, marketing } from "./primitives";
import { cn } from "@/lib/utils";

type LegalPageProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className={marketing.page}>
      <MarketingNav />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        <MarketingContainer narrow>
          <div className="mb-8 rounded-2xl border border-[var(--marketing-brand)]/40 bg-[var(--marketing-brand-muted)] px-4 py-3 text-sm font-medium text-[var(--marketing-brand)]">
            Template — have legal counsel review before commercial launch.
          </div>
          <h1 className={marketing.h2}>{title}</h1>
          <div className={cn(marketing.body, "mt-8 space-y-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--marketing-foreground)]")}>
            {children}
          </div>
          <p className={cn(marketing.bodySm, "mt-12")}>
            <Link href="/" className={marketing.link}>
              ← Back to home
            </Link>
          </p>
        </MarketingContainer>
      </main>
      <MarketingFooter />
    </div>
  );
}

export function LegalContact() {
  return (
    <p>
      Questions? Contact{" "}
      <a href={`mailto:${CONTACT_EMAIL}`} className={marketing.link}>
        {CONTACT_EMAIL}
      </a>
      .
    </p>
  );
}
