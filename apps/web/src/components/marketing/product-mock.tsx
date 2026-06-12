import { AlertTriangle, MessageCircle } from "lucide-react";
import { marketing } from "./primitives/styles";
import { cn } from "@/lib/utils";

export function ProductMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 sm:gap-6",
        className,
      )}
      aria-hidden
    >
      <div className={cn(marketing.card, "overflow-hidden p-0 shadow-md")}>
        <div className="flex items-center gap-2 border-b border-[var(--marketing-border)] px-4 py-3">
          <MessageCircle className="size-4 text-[var(--marketing-brand)]" />
          <span className="text-sm font-medium">SMS conversation</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[var(--marketing-brand)] px-3 py-2 text-sm text-[var(--marketing-brand-foreground)] animate-in fade-in slide-in-from-bottom-2 duration-500">
            Hi Sarah! How was your visit to Oak Street Dental today?
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[var(--marketing-muted)] px-3 py-2 text-sm text-[var(--marketing-foreground)] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
            Wait was long and nobody explained the charges.
          </div>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[var(--marketing-brand)] px-3 py-2 text-sm text-[var(--marketing-brand-foreground)] animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">
            I&apos;m sorry to hear that. Would you like someone from the team to call you?
          </div>
        </div>
      </div>

      <div className={cn(marketing.card, "overflow-hidden p-0 shadow-md")}>
        <div className="flex items-center gap-2 border-b border-[var(--marketing-border)] px-4 py-3">
          <AlertTriangle className="size-4 text-amber-600" />
          <span className="text-sm font-medium">Recovery alert</span>
        </div>
        <div className="p-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Needs attention
            </p>
            <p className="mt-1 font-medium text-[var(--marketing-foreground)]">Sarah M.</p>
            <p className="mt-2 text-sm text-[var(--marketing-muted-foreground)]">
              Complaint: wait time & billing confusion
            </p>
            <div className="mt-3 inline-flex rounded-lg bg-[var(--marketing-brand)] px-3 py-1.5 text-xs font-semibold text-[var(--marketing-brand-foreground)]">
              Assign to staff
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
