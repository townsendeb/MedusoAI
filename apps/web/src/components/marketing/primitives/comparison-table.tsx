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
    <div className={cn(marketing.card, "overflow-hidden", className)}>
      <div className="grid grid-cols-2 border-b border-[var(--marketing-border)] bg-[var(--marketing-muted)] text-sm font-semibold">
        <div className="px-5 py-3 text-[var(--marketing-muted-foreground)]">{emailLabel}</div>
        <div className="border-l border-[var(--marketing-border)] px-5 py-3 text-[var(--marketing-brand)]">
          {medusoLabel}
        </div>
      </div>
      {rows.map((row, index) => (
        <div
          key={row.email}
          className={cn(
            "grid grid-cols-2 text-sm",
            index < rows.length - 1 && "border-b border-[var(--marketing-border)]",
          )}
        >
          <div className="px-5 py-4 text-[var(--marketing-muted-foreground)]">{row.email}</div>
          <div className="border-l border-[var(--marketing-border)] bg-[var(--marketing-brand-muted)]/40 px-5 py-4 font-medium text-[var(--marketing-foreground)]">
            {row.meduso}
          </div>
        </div>
      ))}
    </div>
  );
}
