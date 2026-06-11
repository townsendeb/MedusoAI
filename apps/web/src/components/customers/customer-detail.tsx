"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomer } from "@/lib/customers/queries";
import { formatDate, formatDateTime, formatPhone } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { CustomerActions } from "@/components/customers/customer-actions";
import { CustomerSourceBadge } from "@/components/customers/customer-source-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CustomerDetailProps = {
  organizationId: string;
  customerId: string;
};

export function CustomerDetail({ organizationId, customerId }: CustomerDetailProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.customers.detail(organizationId, customerId),
    queryFn: () => fetchCustomer(customerId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Customer not found"}
        </p>
        <Link href="/customers">
          <Button variant="outline" className="mt-4">
            Back to customers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/customers">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              ← Customers
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CustomerSourceBadge source={data.source} />
            {data.external_id ? (
              <Badge variant="outline">External: {data.external_id}</Badge>
            ) : null}
          </div>
        </div>
        <CustomerActions organizationId={organizationId} customer={data} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Phone</span>
              <span>{formatPhone(data.phone_e164)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span>{data.email ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Last visit</span>
              <span>{formatDate(data.last_visit_date)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Added</span>
              <span>{formatDateTime(data.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {data.conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No outreach conversations yet. SMS outreach arrives in Slice 2.x.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recovery</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.conversations.map((conversation) => (
                  <TableRow key={conversation.id}>
                    <TableCell>{conversation.channel}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{conversation.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{conversation.recovery_status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(conversation.started_at ?? conversation.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
