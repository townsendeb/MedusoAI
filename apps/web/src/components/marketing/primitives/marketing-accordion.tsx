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
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <details
          key={item.question}
          className={cn(marketing.card, "group p-0 [&_summary::-webkit-details-marker]:hidden")}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium marker:content-none">
            <span>{item.question}</span>
            <ChevronDown
              className="size-4 shrink-0 text-[var(--marketing-muted-foreground)] transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div
            className={cn(
              marketing.bodySm,
              "border-t border-[var(--marketing-border)] px-5 py-4",
            )}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
