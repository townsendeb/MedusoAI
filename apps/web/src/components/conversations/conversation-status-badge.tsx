import type { ConversationStatus } from "@meduso/shared";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<ConversationStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  FAILED: "Failed",
  OPTED_OUT: "Opted out",
};

const VARIANTS: Record<
  ConversationStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  SCHEDULED: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  FAILED: "destructive",
  OPTED_OUT: "destructive",
};

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
