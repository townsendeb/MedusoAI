"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer } from "@/lib/customers/mutations";
import { queryKeys } from "@/lib/query-keys";
import { CustomerForm } from "@/components/customers/customer-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CreateCustomerPageProps = {
  organizationId: string;
};

export function CreateCustomerPage({ organizationId }: CreateCustomerPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof createCustomer>[1]) =>
      createCustomer(organizationId, input),
    onSuccess: async (customer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(organizationId) });
      await fetch("/api/outreach/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id }),
      });
      router.push(`/customers/${customer.id}`);
      router.refresh();
    },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/customers">
        <Button variant="ghost" size="sm" className="-ml-2">
          ← Customers
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Add customer</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            submitLabel="Create customer"
            onSubmit={async (values) => {
              await mutation.mutateAsync(values);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
