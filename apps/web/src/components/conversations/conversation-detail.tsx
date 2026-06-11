"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchConversation } from "@/lib/conversations/queries";
import { formatDateTime, formatPhone } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { ConversationRecoveryPanel } from "@/components/conversations/conversation-recovery-panel";
import { ConversationStatusBadge } from "@/components/conversations/conversation-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ConversationDetailProps = {
  organizationId: string;
  conversationId: string;
};

export function ConversationDetail({ organizationId, conversationId }: ConversationDetailProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.conversations.detail(organizationId, conversationId),
    queryFn: () => fetchConversation(conversationId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Conversation not found"}
        </p>
        <Link href="/conversations">
          <Button variant="outline" className="mt-4">
            Back to conversations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/conversations">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            ← Conversations
          </Button>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{data.customers.name}</h1>
          <ConversationStatusBadge status={data.status} />
          <Badge variant="outline">{data.channel}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatPhone(data.customers.phone_e164)}
          {data.customers.email ? ` · ${data.customers.email}` : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Started</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{formatDateTime(data.started_at)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ended</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{formatDateTime(data.ended_at)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recovery</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{data.recovery_status.replaceAll("_", " ")}</CardContent>
        </Card>
      </div>

      <ConversationRecoveryPanel organizationId={organizationId} conversation={data} />

      {data.analysis ? (
        <Card>
          <CardHeader>
            <CardTitle>AI analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>{data.analysis.summary}</p>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Sentiment</p>
                <p className="font-medium">{Number(data.analysis.sentiment_score).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Satisfaction</p>
                <p className="font-medium">{data.analysis.satisfaction_score}/10</p>
              </div>
              <div>
                <p className="text-muted-foreground">Churn risk</p>
                <p className="font-medium">{data.analysis.churn_risk}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Recommended action</p>
              <p className="mt-1">{data.analysis.recommended_action}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Analyzed {formatDateTime(data.analysis.analyzed_at)}
              {data.analysis.model ? ` · ${data.analysis.model}` : ""}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!data.messages.length ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            data.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                  message.role === "CUSTOMER"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : message.role === "ASSISTANT"
                      ? "bg-muted"
                      : "mx-auto bg-transparent text-center text-xs text-muted-foreground",
                )}
              >
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide opacity-70">
                  {message.role === "CUSTOMER"
                    ? data.customers.name
                    : message.role === "ASSISTANT"
                      ? "Meduso"
                      : "System"}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="mt-1 text-[11px] opacity-70">{formatDateTime(message.created_at)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div>
        <Link href={`/customers/${data.customers.id}`}>
          <Button variant="outline" size="sm">
            View customer profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
