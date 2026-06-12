import type { LucideIcon } from "lucide-react";
import { marketing } from "./styles";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(marketing.cardInteractive, "p-6", className)}>
      <div className={marketing.iconBox}>
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className={cn(marketing.h3, "mt-4")}>{title}</h3>
      <p className={cn(marketing.bodySm, "mt-2")}>{description}</p>
    </div>
  );
}
