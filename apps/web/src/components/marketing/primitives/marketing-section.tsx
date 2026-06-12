import { marketingSectionClass, type SectionVariant } from "./styles";
import { MarketingContainer } from "./marketing-container";
import { cn } from "@/lib/utils";

type MarketingSectionProps = {
  id?: string;
  variant?: SectionVariant;
  container?: "default" | "narrow" | "full";
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
};

export function MarketingSection({
  id,
  variant = "default",
  container = "default",
  className,
  containerClassName,
  children,
}: MarketingSectionProps) {
  const narrow = container === "narrow";

  return (
    <section id={id} className={cn(marketingSectionClass(variant), className)}>
      {container === "full" ? (
        children
      ) : (
        <MarketingContainer narrow={narrow} className={containerClassName}>
          {children}
        </MarketingContainer>
      )}
    </section>
  );
}
