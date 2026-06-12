import { Check, X } from "lucide-react";
import { marketing } from "./styles";
import { cn } from "@/lib/utils";

type ComparisonRow = {
  email: string;
  meduso: string;
};

type ComparisonTableProps = {
  emailLabel: string;
  medusoLabel: string;
  rows: readonly ComparisonRow[];
  className?: string;
};

export function ComparisonTable({
  emailLabel,
  medusoLabel,
  rows,
  className,
}: ComparisonTableProps) {
  return (
    <div className={cn(marketing.glass, "overflow-hidden", className)}>
      <div className="grid grid-cols-2 text-sm font-bold">
        <div className="bg-[var(--marketing-muted)] px-6 py-4 text-[var(--marketing-muted-foreground)]">
          {emailLabel}
        </div>
        <div className="bg-[var(--marketing-brand-muted)] px-6 py-4 text-[var(--marketing-brand)]">
          {medusoLabel}
        </div>
      </div>
      {rows.map((row, index) => (
        <div
          key={row.email}
          className={cn(
            "grid grid-cols-2 text-sm md:text-base",
            index < rows.length - 1 && "border-t border-[var(--marketing-border)]",
          )}
        >
          <div className="flex items-start gap-3 px-6 py-5 text-[var(--marketing-muted-foreground)]">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <X className="size-3.5" aria-hidden />
            </span>
            {row.email}
          </div>
          <div className="flex items-start gap-3 border-l border-[var(--marketing-border)] bg-[var(--marketing-brand-muted)] px-6 py-5 font-medium text-[var(--marketing-secondary)]">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="size-3.5" aria-hidden />
            </span>
            {row.meduso}
          </div>
        </div>
      ))}
    </div>
  );
}
