import Link from "next/link";
import { appUrl, BRAND_NAME, CONTACT_EMAIL } from "@/lib/marketing/config";
import { MarketingContainer, marketing } from "@/components/marketing/primitives";
import { cn } from "@/lib/utils";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={marketing.footer}>
      <MarketingContainer className="py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold">{BRAND_NAME}</p>
            <p className={cn(marketing.bodySm, "mt-2 max-w-xs")}>
              Real customer feedback for local businesses — without the email survey.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-16">
            <div>
              <p className="text-sm font-semibold">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--marketing-muted-foreground)]">
                <li>
                  <a href="#how-it-works" className="hover:text-[var(--marketing-foreground)]">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[var(--marketing-foreground)]">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href={appUrl("/register")} className="hover:text-[var(--marketing-foreground)]">
                    Sign up
                  </a>
                </li>
                <li>
                  <a href={appUrl("/login")} className="hover:text-[var(--marketing-foreground)]">
                    Sign in
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">Legal</p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--marketing-muted-foreground)]">
                <li>
                  <Link href="/privacy" className="hover:text-[var(--marketing-foreground)]">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[var(--marketing-foreground)]">
                    Terms
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:text-[var(--marketing-foreground)]"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className={cn(marketing.trust, "mt-10 border-t border-[var(--marketing-border)] pt-6")}>
          © {year} Meduso AI. All rights reserved.
        </p>
      </MarketingContainer>
    </footer>
  );
}
