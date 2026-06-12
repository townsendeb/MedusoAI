"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { appUrl, BRAND_NAME, NAV_LINKS } from "@/lib/marketing/config";
import {
  MarketingButton,
  MarketingContainer,
  marketing,
} from "@/components/marketing/primitives";
import { cn } from "@/lib/utils";

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={marketing.nav}>
      <MarketingContainer className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-xl font-semibold tracking-tight text-[var(--marketing-foreground)]">
          {BRAND_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--marketing-muted-foreground)] transition-colors hover:text-[var(--marketing-foreground)]"
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
            className="inline-flex size-9 items-center justify-center rounded-lg text-[var(--marketing-foreground)] hover:bg-[var(--marketing-muted)]"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </MarketingContainer>

      <div
        className={cn(
          "border-t border-[var(--marketing-border)] bg-[var(--marketing-surface)] md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <MarketingContainer className="flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-[var(--marketing-foreground)] hover:bg-[var(--marketing-muted)]"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <MarketingButton href={appUrl("/login")} variant="secondary" className="mt-2 w-full">
            Sign in
          </MarketingButton>
        </MarketingContainer>
      </div>
    </header>
  );
}
