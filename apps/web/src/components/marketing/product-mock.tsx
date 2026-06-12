import { AlertTriangle, MessageCircle } from "lucide-react";
import { marketing } from "./primitives/styles";
import { cn } from "@/lib/utils";

export function ProductMock({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-4xl", className)} aria-hidden>
      <div className={cn(marketing.glass, "relative overflow-hidden")}>
        <div className="flex items-center gap-2 border-b border-[var(--marketing-border)] bg-[var(--marketing-muted)] px-5 py-3.5">
          <div className="flex gap-2">
            <span className="size-3 rounded-full bg-[#ff6b6b]" />
            <span className="size-3 rounded-full bg-[#ffd93d]" />
            <span className="size-3 rounded-full bg-[#6bcb77]" />
          </div>
          <span className="text-sm font-semibold text-[var(--marketing-muted-foreground)] mx-auto">
            Meduso — live recovery dashboard
          </span>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-5 md:gap-6 md:p-7">
          <div className="md:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <div className={marketing.iconBox}>
                <MessageCircle className="size-5" aria-hidden />
              </div>
              <span className="font-bold text-[var(--marketing-secondary)]">SMS conversation</span>
            </div>
            <div className="space-y-3 rounded-[1.5rem] border border-[var(--marketing-border)] bg-[var(--marketing-muted)] p-5">
              <div className="ml-auto max-w-[88%] rounded-[1.25rem] rounded-br-md marketing-btn-primary px-4 py-3 text-sm font-medium">
                Hi Sarah! How was your visit to Oak Street Dental today?
              </div>
              <div className="max-w-[88%] rounded-[1.25rem] rounded-bl-md border border-[var(--marketing-border)] bg-[var(--marketing-card)] px-4 py-3 text-sm font-medium text-[var(--marketing-secondary)]">
                Wait was long and nobody explained the charges.
              </div>
              <div className="ml-auto max-w-[88%] rounded-[1.25rem] rounded-br-md marketing-btn-primary px-4 py-3 text-sm font-medium">
                Sorry to hear that — want someone from the team to call you?
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--marketing-border)] text-[var(--marketing-brand)]">
                <AlertTriangle className="size-5" aria-hidden />
              </div>
              <span className="font-bold text-[var(--marketing-secondary)]">Recovery alert</span>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--marketing-brand)]/40 bg-[var(--marketing-brand-muted)] p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--marketing-brand)]">
                Needs attention
              </p>
              <p className="mt-1 text-lg font-bold text-[var(--marketing-secondary)]">Sarah M.</p>
              <p className="mt-2 text-sm font-medium text-[var(--marketing-muted-foreground)]">
                Wait time & billing confusion
              </p>
              <div className="mt-4 inline-flex rounded-full marketing-btn-primary px-4 py-2 text-xs font-bold">
                Assign to staff →
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
