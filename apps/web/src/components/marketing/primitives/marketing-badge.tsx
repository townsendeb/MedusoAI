import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const marketingBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        brand: "bg-[var(--marketing-brand)] text-[var(--marketing-brand-foreground)]",
        muted: "bg-[var(--marketing-brand-muted)] text-[var(--marketing-brand)]",
        outline:
          "border border-[var(--marketing-border)] text-[var(--marketing-muted-foreground)]",
      },
    },
    defaultVariants: {
      variant: "brand",
    },
  },
);

type MarketingBadgeProps = VariantProps<typeof marketingBadgeVariants> & {
  className?: string;
  children: React.ReactNode;
};

export function MarketingBadge({ variant, className, children }: MarketingBadgeProps) {
  return (
    <span className={cn(marketingBadgeVariants({ variant }), className)}>{children}</span>
  );
}
