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
      <main className="py-16 md:py-24">
        <MarketingContainer narrow>
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Template — have legal counsel review before commercial launch.
          </div>
          <h1 className={marketing.h2}>{title}</h1>
          <div className={cn(marketing.body, "prose-marketing mt-8 space-y-6")}>{children}</div>
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
