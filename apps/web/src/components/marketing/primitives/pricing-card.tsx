import { getTierLimits, type PricingTier } from "@/lib/marketing/config";
import { MarketingBadge } from "./marketing-badge";
import { MarketingButton } from "./marketing-button";
import { marketing } from "./styles";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  tier: PricingTier;
};

export function PricingCard({ tier }: PricingCardProps) {
  const limits = getTierLimits(tier.plan);

  return (
    <div
      className={cn(
        "relative flex flex-col p-7 md:p-8",
        tier.highlighted ? marketing.cardHighlight : marketing.card,
      )}
    >
      {tier.badge ? (
        <MarketingBadge className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          {tier.badge}
        </MarketingBadge>
      ) : null}

      <p className="font-display text-sm font-bold text-[var(--marketing-muted-foreground)]">{tier.name}</p>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-display text-5xl font-extrabold tracking-tight",
            tier.highlighted && "text-[var(--marketing-brand)]",
          )}
        >
          {tier.price}
        </span>
        {tier.priceNote ? (
          <span className="text-sm font-medium text-[var(--marketing-muted-foreground)]">
            {tier.priceNote}
          </span>
        ) : null}
      </div>

      <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm font-medium text-[var(--marketing-muted-foreground)]">
        <li className="flex justify-between gap-2 rounded-xl bg-[var(--marketing-muted)] px-3 py-2.5">
          <span>SMS</span>
          <span className="text-[var(--marketing-foreground)]">{limits.sms}</span>
        </li>
        <li className="flex justify-between gap-2 rounded-xl bg-[var(--marketing-muted)] px-3 py-2.5">
          <span>Voice</span>
          <span className="text-[var(--marketing-foreground)]">{limits.voice}</span>
        </li>
        <li className="flex justify-between gap-2 rounded-xl bg-[var(--marketing-muted)] px-3 py-2.5">
          <span>Imports</span>
          <span className="text-[var(--marketing-foreground)]">{limits.imports}</span>
        </li>
      </ul>

      <MarketingButton
        href={tier.ctaHref}
        variant={tier.highlighted ? "primary" : "secondary"}
        className="mt-8 w-full"
        external={tier.isMailto}
      >
        {tier.cta}
      </MarketingButton>
    </div>
  );
}
