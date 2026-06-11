"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecoveryStatus } from "@meduso/shared";
import { updateConversationRecovery } from "@/lib/conversations/mutations";
import { formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConversationDetail } from "@/lib/conversations/queries";

type ConversationRecoveryPanelProps = {
  organizationId: string;
  conversation: ConversationDetail;
};

const STATUS_ACTIONS: { status: RecoveryStatus; label: string; variant?: "default" | "outline" }[] =
  [
    { status: "IN_RECOVERY", label: "Mark in recovery", variant: "outline" },
    { status: "RECOVERED", label: "Mark recovered" },
    { status: "RESOLVED", label: "Mark resolved", variant: "outline" },
    { status: "LOST", label: "Mark lost", variant: "outline" },
  ];

export function ConversationRecoveryPanel({
  organizationId,
  conversation,
}: ConversationRecoveryPanelProps) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof updateConversationRecovery>[1]) =>
      updateConversationRecovery(conversation.id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(organizationId, conversation.id),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.overview(organizationId),
      });
      setNote("");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recovery workflow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Current status:{" "}
          <span className="font-medium text-foreground">
            {conversation.recovery_status.replaceAll("_", " ")}
          </span>
        </p>

        <div className="space-y-2">
          <Label htmlFor="recovery-note">Note (optional)</Label>
          <Input
            id="recovery-note"
            value={note}
            placeholder="e.g. Offered 20% discount, customer accepted"
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_ACTIONS.map((action) => (
            <Button
              key={action.status}
              size="sm"
              variant={action.variant ?? "default"}
              disabled={mutation.isPending || conversation.recovery_status === action.status}
              onClick={() =>
                mutation.mutate({
                  recoveryStatus: action.status,
                  action:
                    action.status === "RECOVERED"
                      ? "MARK_RECOVERED"
                      : action.status === "RESOLVED"
                        ? "MARK_RESOLVED"
                        : "NOTE",
                  note: note || null,
                })
              }
            >
              {action.label}
            </Button>
          ))}
        </div>

        {conversation.recovery_actions.length > 0 ? (
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium">Activity</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {conversation.recovery_actions.map((entry) => (
                <li key={entry.id}>
                  <span className="font-medium text-foreground">
                    {entry.action.replaceAll("_", " ")}
                  </span>
                  {entry.note ? ` — ${entry.note}` : ""}
                  <span className="block text-xs">{formatDateTime(entry.created_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
