"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchConversations } from "@/lib/conversations/queries";
import { formatDateTime, formatPhone } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { ConversationStatusBadge } from "@/components/conversations/conversation-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ConversationsListProps = {
  organizationId: string;
};

export function ConversationsList({ organizationId }: ConversationsListProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.conversations.all(organizationId),
    queryFn: fetchConversations,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-destructive">
          Failed to load conversations: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No conversations yet"
        description="SMS and voice outreach conversations will appear here after customers are contacted."
        actions={[
          { label: "Add customer", href: "/customers/new", variant: "outline" },
          { label: "View customers", href: "/customers" },
        ]}
      />
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Ended</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((conversation) => (
            <TableRow key={conversation.id}>
              <TableCell>
                <Link
                  href={`/conversations/${conversation.id}`}
                  className="font-medium hover:underline"
                >
                  {conversation.customers.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatPhone(conversation.customers.phone_e164)}
                </p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{conversation.channel}</Badge>
              </TableCell>
              <TableCell>
                <ConversationStatusBadge status={conversation.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(conversation.started_at)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(conversation.ended_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t px-4 py-3 text-sm text-muted-foreground">
        {data.length} conversation{data.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
