import { cn } from "@/lib/utils";

/** Scoped marketing layout tokens — pair with `.marketing` ancestor in globals.css */
export const marketing = {
  page: "marketing min-h-screen bg-[var(--marketing-surface)] text-[var(--marketing-foreground)]",
  container: "mx-auto w-full max-w-6xl px-6",
  containerNarrow: "mx-auto w-full max-w-3xl px-6",
  section: "py-20 md:py-28",
  sectionMuted: "bg-[var(--marketing-muted)]",
  sectionBrand: "bg-[var(--marketing-brand-muted)]",
  eyebrow:
    "text-xs font-semibold uppercase tracking-widest text-[var(--marketing-brand)]",
  h1: "text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl",
  h2: "text-3xl font-semibold tracking-tight text-balance sm:text-4xl",
  h3: "text-lg font-semibold tracking-tight",
  lead: "text-lg text-[var(--marketing-muted-foreground)] text-pretty sm:text-xl",
  body: "text-base text-[var(--marketing-muted-foreground)] leading-relaxed",
  bodySm: "text-sm text-[var(--marketing-muted-foreground)] leading-relaxed",
  trust: "text-sm text-[var(--marketing-muted-foreground)]",
  card: "rounded-2xl border border-[var(--marketing-border)] bg-[var(--marketing-card)] shadow-sm",
  cardInteractive:
    "rounded-2xl border border-[var(--marketing-border)] bg-[var(--marketing-card)] shadow-sm transition-shadow hover:shadow-md",
  cardHighlight:
    "rounded-2xl border-2 border-[var(--marketing-brand)] bg-[var(--marketing-card)] shadow-md ring-1 ring-[var(--marketing-brand)]/20",
  iconBox:
    "flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--marketing-brand-muted)] text-[var(--marketing-brand)]",
  stepNumber:
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--marketing-brand)] text-sm font-semibold text-[var(--marketing-brand-foreground)]",
  nav: "sticky top-0 z-50 border-b border-[var(--marketing-border)]/60 bg-[var(--marketing-surface)]/80 backdrop-blur-md",
  footer: "border-t border-[var(--marketing-border)] bg-[var(--marketing-muted)]",
  ctaBand:
    "rounded-3xl bg-[var(--marketing-brand)] px-8 py-12 text-center text-[var(--marketing-brand-foreground)] sm:px-12 sm:py-16",
  heroGradient:
    "relative overflow-hidden bg-gradient-to-b from-[var(--marketing-brand-muted)] via-[var(--marketing-surface)] to-[var(--marketing-surface)]",
  link: "text-[var(--marketing-brand)] underline-offset-4 hover:underline",
} as const;

export type SectionVariant = "default" | "muted" | "brand";

export function sectionVariantClass(variant: SectionVariant = "default"): string {
  switch (variant) {
    case "muted":
      return marketing.sectionMuted;
    case "brand":
      return marketing.sectionBrand;
    default:
      return "";
  }
}

export function marketingSectionClass(
  variant: SectionVariant = "default",
  className?: string,
): string {
  return cn(marketing.section, sectionVariantClass(variant), className);
}
