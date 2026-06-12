import { marketing } from "./styles";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        centered && "mx-auto max-w-2xl text-center",
        !centered && "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? <p className={cn(marketing.eyebrow, "mb-3")}>{eyebrow}</p> : null}
      <h2 className={marketing.h2}>{title}</h2>
      {description ? <p className={cn(marketing.lead, "mt-4")}>{description}</p> : null}
    </div>
  );
}
