"use client";

import { ChevronDown } from "lucide-react";
import { marketing } from "./styles";
import { cn } from "@/lib/utils";

type AccordionItem = {
  question: string;
  answer: string;
};

type MarketingAccordionProps = {
  items: readonly AccordionItem[];
  className?: string;
};

export function MarketingAccordion({ items, className }: MarketingAccordionProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {items.map((item) => (
        <details
          key={item.question}
          className={cn(
            marketing.cardInteractive,
            "group p-0 [&_summary::-webkit-details-marker]:hidden",
          )}
        >
          <summary className="font-display flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-bold marker:content-none">
            <span>{item.question}</span>
            <ChevronDown
              className="size-5 shrink-0 rounded-full bg-[var(--marketing-muted)] p-0.5 text-[var(--marketing-muted-foreground)] transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div
            className={cn(
              marketing.body,
              "border-t border-[var(--marketing-border)] px-6 py-5",
            )}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
