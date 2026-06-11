"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "@/lib/customers/queries";
import { formatDate, formatPhone } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { CustomerSourceBadge } from "@/components/customers/customer-source-badge";
import { ImportCustomersDialog } from "@/components/customers/import-customers-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CustomersListProps = {
  organizationId: string;
  refetchInterval?: number | false;
  onImportStarted?: (importId: string) => void;
};

export function CustomersList({
  organizationId,
  refetchInterval = false,
  onImportStarted,
}: CustomersListProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.customers.all(organizationId),
    queryFn: fetchCustomers,
    refetchInterval,
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
          Failed to load customers: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="text-lg font-medium">No customers yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Import customers via CSV or API to start post-visit outreach.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/customers/new">
            <Button>Add customer</Button>
          </Link>
          <ImportCustomersDialog
            organizationId={organizationId}
            onImportStarted={onImportStarted}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Last visit</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Link
                  href={`/customers/${customer.id}`}
                  className="font-medium hover:underline"
                >
                  {customer.name}
                </Link>
              </TableCell>
              <TableCell>{formatPhone(customer.phone_e164)}</TableCell>
              <TableCell className="text-muted-foreground">{customer.email ?? "—"}</TableCell>
              <TableCell>{formatDate(customer.last_visit_date)}</TableCell>
              <TableCell>
                <CustomerSourceBadge source={customer.source} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(customer.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t px-4 py-3 text-sm text-muted-foreground">
        {data.length} customer{data.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}
