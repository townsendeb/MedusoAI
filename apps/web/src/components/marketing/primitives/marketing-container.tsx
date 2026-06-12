import { marketing } from "./styles";
import { cn } from "@/lib/utils";

type MarketingContainerProps = {
  narrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function MarketingContainer({
  narrow = false,
  className,
  children,
}: MarketingContainerProps) {
  return (
    <div className={cn(narrow ? marketing.containerNarrow : marketing.container, className)}>
      {children}
    </div>
  );
}
