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
        "relative flex flex-col p-6",
        tier.highlighted ? marketing.cardHighlight : marketing.card,
      )}
    >
      {tier.badge ? (
        <MarketingBadge className="absolute -top-3 left-1/2 -translate-x-1/2">
          {tier.badge}
        </MarketingBadge>
      ) : null}

      <p className="text-sm font-medium text-[var(--marketing-muted-foreground)]">{tier.name}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
        {tier.priceNote ? (
          <span className="text-sm text-[var(--marketing-muted-foreground)]">{tier.priceNote}</span>
        ) : null}
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm text-[var(--marketing-muted-foreground)]">
        <li className="flex justify-between gap-2 border-b border-[var(--marketing-border)] pb-2">
          <span>SMS</span>
          <span className="font-medium text-[var(--marketing-foreground)]">{limits.sms}</span>
        </li>
        <li className="flex justify-between gap-2 border-b border-[var(--marketing-border)] pb-2">
          <span>Voice</span>
          <span className="font-medium text-[var(--marketing-foreground)]">{limits.voice}</span>
        </li>
        <li className="flex justify-between gap-2">
          <span>Imports</span>
          <span className="font-medium text-[var(--marketing-foreground)]">{limits.imports}</span>
        </li>
      </ul>

      <MarketingButton
        href={tier.ctaHref}
        variant={tier.highlighted ? "primary" : "secondary"}
        className="mt-6 w-full"
        external={tier.isMailto}
      >
        {tier.cta}
      </MarketingButton>
    </div>
  );
}
