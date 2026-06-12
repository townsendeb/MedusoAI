import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const marketingButtonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--marketing-brand)] text-[var(--marketing-brand-foreground)] hover:opacity-90 shadow-sm",
        secondary:
          "border border-[var(--marketing-border)] bg-[var(--marketing-card)] text-[var(--marketing-foreground)] hover:bg-[var(--marketing-muted)]",
        ghost:
          "text-[var(--marketing-foreground)] hover:bg-[var(--marketing-muted)]",
        inverse:
          "bg-[var(--marketing-brand-foreground)] text-[var(--marketing-brand)] hover:opacity-90 shadow-sm",
        outlineInverse:
          "border border-[var(--marketing-brand-foreground)]/30 text-[var(--marketing-brand-foreground)] hover:bg-[var(--marketing-brand-foreground)]/10",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type MarketingButtonProps = VariantProps<typeof marketingButtonVariants> & {
  href: string;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
};

export function MarketingButton({
  href,
  variant,
  size,
  className,
  children,
  external,
}: MarketingButtonProps) {
  const classes = cn(marketingButtonVariants({ variant, size }), className);
  const isMailto = href.startsWith("mailto:");
  const isExternal = external || isMailto || href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...(external && !isMailto && href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export { marketingButtonVariants };
