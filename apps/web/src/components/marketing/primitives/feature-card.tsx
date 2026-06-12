import type { LucideIcon } from "lucide-react";
import { marketing } from "./styles";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  featured?: boolean;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  featured,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        featured ? marketing.cardHighlight : marketing.cardInteractive,
        "flex h-full flex-col p-7 md:p-8",
        className,
      )}
    >
      <div className={featured ? marketing.iconBoxLg : marketing.iconBox}>
        <Icon className={featured ? "size-7 text-white" : "size-6"} aria-hidden />
      </div>
      <h3 className={cn(marketing.h3, "mt-5")}>{title}</h3>
      <p className={cn(marketing.body, "mt-3")}>{description}</p>
      {featured ? (
        <div
          className="mt-6 space-y-2 rounded-xl border border-[var(--marketing-border)] bg-[var(--marketing-muted)] p-4"
          aria-hidden
        >
          <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm marketing-btn-primary px-3 py-2 text-xs font-medium">
            Hi! How was your visit today?
          </div>
          <div className="max-w-[85%] rounded-xl rounded-bl-sm border border-[var(--marketing-border)] bg-[var(--marketing-card)] px-3 py-2 text-xs font-medium text-[var(--marketing-secondary)]">
            Pretty good — staff was friendly.
          </div>
          <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm marketing-btn-primary px-3 py-2 text-xs font-medium">
            Glad to hear it. Anything we could do better?
          </div>
        </div>
      ) : null}
    </div>
  );
}
