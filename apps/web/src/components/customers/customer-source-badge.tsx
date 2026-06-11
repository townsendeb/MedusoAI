import type { CustomerSource } from "@meduso/shared";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<CustomerSource, string> = {
  CSV: "CSV",
  API: "API",
  ZAPIER: "Zapier",
  MANUAL: "Manual",
};

export function CustomerSourceBadge({ source }: { source: CustomerSource }) {
  return <Badge variant="secondary">{LABELS[source]}</Badge>;
}
