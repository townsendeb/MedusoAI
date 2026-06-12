import { marketing } from "./styles";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-14 md:mb-20",
        centered && "mx-auto max-w-3xl text-center",
        !centered && "max-w-3xl",
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn(marketing.eyebrow, centered && "mx-auto", "mb-6 w-fit")}>
          <span className={marketing.eyebrowDot} aria-hidden />
          {eyebrow}
        </p>
      ) : null}
      <h2 className={marketing.h2}>
        {titleHighlight ? (
          <>
            {title}{" "}
            <span className={marketing.accentText}>{titleHighlight}</span>
          </>
        ) : (
          title
        )}
      </h2>
      {description ? <p className={cn(marketing.lead, "mt-5")}>{description}</p> : null}
    </div>
  );
}
