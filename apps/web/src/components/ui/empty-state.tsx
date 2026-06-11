import Link from "next/link";
import { Button } from "@/components/ui/button";

type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline";
};

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: EmptyStateAction[];
};

export function EmptyState({ title, description, actions = [] }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {actions.length > 0 ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actions.map((action) =>
            action.href ? (
              <Link key={action.label} href={action.href}>
                <Button variant={action.variant ?? "default"}>{action.label}</Button>
              </Link>
            ) : (
              <Button
                key={action.label}
                variant={action.variant ?? "default"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
