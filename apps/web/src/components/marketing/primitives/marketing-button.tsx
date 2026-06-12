import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const marketingButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-bold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "marketing-btn-primary",
        secondary:
          "border-2 border-[var(--marketing-secondary)] bg-transparent text-[var(--marketing-secondary)] hover:bg-[var(--marketing-secondary)] hover:text-black",
        ghost:
          "text-[var(--marketing-muted-foreground)] hover:bg-[var(--marketing-card)] hover:text-[var(--marketing-secondary)]",
        inverse:
          "bg-[var(--marketing-secondary)] text-black hover:bg-[var(--marketing-secondary)]/90",
        outlineInverse:
          "border-2 border-[var(--marketing-secondary)] text-[var(--marketing-secondary)] hover:bg-[var(--marketing-secondary)] hover:text-black",
      },
      size: {
        default: "h-12 px-7",
        sm: "h-10 px-5 text-sm",
        lg: "h-14 px-9 text-base",
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
