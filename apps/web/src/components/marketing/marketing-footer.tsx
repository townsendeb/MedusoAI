import Link from "next/link";
import { Sparkles } from "lucide-react";
import { appUrl, BRAND_NAME, CONTACT_EMAIL } from "@/lib/marketing/config";
import { MarketingContainer, marketing } from "@/components/marketing/primitives";
import { cn } from "@/lib/utils";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={marketing.footer}>
      <MarketingContainer className="py-16">
        <div className="flex flex-col gap-12 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-display flex items-center gap-2.5 text-lg font-bold text-[var(--marketing-secondary)]">
              <span className="flex size-9 items-center justify-center rounded-2xl marketing-btn-primary">
                <Sparkles className="size-4" aria-hidden />
              </span>
              {BRAND_NAME}
            </div>
            <p className={cn(marketing.body, "mt-4 max-w-xs")}>
              Real customer feedback for local businesses — without the email survey.
            </p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-20">
            <div>
              <p className="text-sm font-bold text-[var(--marketing-secondary)]">Product</p>
              <ul className="mt-4 space-y-3 text-sm font-medium text-[var(--marketing-muted-foreground)]">
                <li>
                  <a href="#how-it-works" className="hover:text-[var(--marketing-brand)]">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[var(--marketing-brand)]">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href={appUrl("/register")} className="hover:text-[var(--marketing-brand)]">
                    Sign up
                  </a>
                </li>
                <li>
                  <a href={appUrl("/login")} className="hover:text-[var(--marketing-brand)]">
                    Sign in
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--marketing-secondary)]">Legal</p>
              <ul className="mt-4 space-y-3 text-sm font-medium text-[var(--marketing-muted-foreground)]">
                <li>
                  <Link href="/privacy" className="hover:text-[var(--marketing-brand)]">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[var(--marketing-brand)]">
                    Terms
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:text-[var(--marketing-brand)]"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className={cn(marketing.trust, "mt-12 border-t border-[var(--marketing-border)] pt-8")}>
          © {year} Meduso AI. All rights reserved.
        </p>
      </MarketingContainer>
    </footer>
  );
}
