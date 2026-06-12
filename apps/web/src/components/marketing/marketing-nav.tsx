"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { appUrl, BRAND_NAME, NAV_LINKS } from "@/lib/marketing/config";
import { MarketingButton, marketing } from "@/components/marketing/primitives";
import { cn } from "@/lib/utils";

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={marketing.nav}>
      <div className={marketing.navInner}>
        <Link
          href="/"
          className="font-display flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--marketing-secondary)]"
        >
          <span className="flex size-9 items-center justify-center rounded-2xl marketing-btn-primary">
            <Sparkles className="size-4" aria-hidden />
          </span>
          {BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--marketing-muted-foreground)] transition-colors hover:bg-[var(--marketing-muted)] hover:text-[var(--marketing-secondary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <MarketingButton href={appUrl("/login")} variant="ghost" size="sm">
            Sign in
          </MarketingButton>
          <MarketingButton href={appUrl("/register")} size="sm">
            Start free
          </MarketingButton>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <MarketingButton href={appUrl("/register")} size="sm">
            Start free
          </MarketingButton>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--marketing-border)] text-[var(--marketing-secondary)]"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-auto fixed inset-x-4 top-[5.25rem] z-50 rounded-[1.75rem] border border-[var(--marketing-border)] bg-[var(--marketing-card)] p-5 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--marketing-secondary)] hover:bg-[var(--marketing-muted)]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <MarketingButton href={appUrl("/login")} variant="secondary" className="mt-3 w-full">
            Sign in
          </MarketingButton>
        </div>
      </div>
    </header>
  );
}
