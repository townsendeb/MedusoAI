import { cn } from "@/lib/utils";

/** Scoped marketing layout tokens — pair with `.marketing` ancestor in globals.css */
export const marketing = {
  page: "marketing min-h-screen bg-[var(--marketing-surface)] text-[var(--marketing-foreground)]",
  container: "mx-auto w-full max-w-6xl px-6",
  containerNarrow: "mx-auto w-full max-w-3xl px-6",
  section: "relative py-24 md:py-32",
  sectionMuted: "bg-[var(--marketing-muted)]",
  sectionElevated: "bg-[var(--marketing-surface-elevated)]",
  eyebrow:
    "inline-flex items-center gap-2 rounded-full border border-[var(--marketing-border)] bg-[var(--marketing-card)] px-4 py-1.5 text-sm font-semibold text-[var(--marketing-brand)]",
  eyebrowDot: "size-2 rounded-full bg-[var(--marketing-brand)]",
  h1: "font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.75rem] lg:leading-[1.08]",
  h2: "font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]",
  h3: "font-display text-xl font-bold tracking-tight",
  lead: "text-lg text-[var(--marketing-muted-foreground)] text-pretty sm:text-xl sm:leading-relaxed",
  body: "text-base text-[var(--marketing-muted-foreground)] leading-relaxed",
  bodySm: "text-sm text-[var(--marketing-muted-foreground)] leading-relaxed",
  trust: "text-sm font-medium text-[var(--marketing-muted-foreground)]",
  glass: "rounded-[2rem] border border-[var(--marketing-border)] bg-[var(--marketing-card)]",
  card: "rounded-[2rem] border border-[var(--marketing-border)] bg-[var(--marketing-card)]",
  cardInteractive:
    "rounded-[2rem] border border-[var(--marketing-border)] bg-[var(--marketing-card)] transition-colors duration-200 hover:border-[var(--marketing-brand)]/40",
  cardHighlight:
    "rounded-[2rem] border-2 border-[var(--marketing-brand)] bg-[var(--marketing-card)]",
  iconBox:
    "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--marketing-brand-muted)] text-[var(--marketing-brand)]",
  iconBoxLg:
    "flex size-16 shrink-0 items-center justify-center rounded-[1.25rem] marketing-btn-primary",
  stepNumber:
    "flex size-12 shrink-0 items-center justify-center rounded-2xl marketing-btn-primary text-base font-bold",
  nav: "pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 md:px-6 md:pt-6",
  navInner:
    "pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-[var(--marketing-border)] bg-[var(--marketing-card)] px-5 py-3 md:px-6",
  footer: "border-t border-[var(--marketing-border)] bg-[var(--marketing-surface)]",
  ctaBand:
    "relative overflow-hidden rounded-[2.5rem] border border-[var(--marketing-brand)] bg-[var(--marketing-card)] px-8 py-16 text-center sm:px-12 sm:py-20",
  heroMesh: "relative overflow-hidden bg-[var(--marketing-surface)]",
  accentText: "text-[var(--marketing-brand)]",
  link: "font-semibold text-[var(--marketing-brand)] underline-offset-4 hover:underline",
  statBubble:
    "flex flex-col items-center justify-center rounded-[1.75rem] border border-[var(--marketing-border)] bg-[var(--marketing-card)] px-6 py-8 text-center",
  statValue:
    "font-display text-4xl font-extrabold tracking-tight text-[var(--marketing-secondary)] sm:text-5xl",
  statLabel: "mt-2 text-sm font-medium text-[var(--marketing-muted-foreground)]",
} as const;

export type SectionVariant = "default" | "muted" | "elevated";

export function sectionVariantClass(variant: SectionVariant = "default"): string {
  switch (variant) {
    case "muted":
      return marketing.sectionMuted;
    case "elevated":
      return marketing.sectionElevated;
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
