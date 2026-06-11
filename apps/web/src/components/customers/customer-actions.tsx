"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Customer } from "@meduso/shared";
import { deleteCustomer, updateCustomer } from "@/lib/customers/mutations";
import { queryKeys } from "@/lib/query-keys";
import { CustomerForm, type CustomerFormValues } from "@/components/customers/customer-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CustomerActionsProps = {
  organizationId: string;
  customer: Customer;
};

export function CustomerActions({ organizationId, customer }: CustomerActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(organizationId) });
    queryClient.invalidateQueries({
      queryKey: queryKeys.customers.detail(organizationId, customer.id),
    });
  };

  const updateMutation = useMutation({
    mutationFn: (values: CustomerFormValues) =>
      updateCustomer(customer.id, values, customer.metadata),
    onSuccess: () => {
      invalidate();
      setEditOpen(false);
      router.refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCustomer(customer.id),
    onSuccess: () => {
      invalidate();
      router.push("/customers");
      router.refresh();
    },
  });

  const voiceMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/outreach/voice/${customer.id}`, { method: "POST" }).then(async (response) => {
        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          throw new Error(body.error ?? "Failed to start voice call");
        }
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all(organizationId),
      });
    },
  });

  const initialValues: Partial<CustomerFormValues> = {
    name: customer.name,
    phone: customer.phone_e164,
    email: customer.email,
    visitDate: customer.last_visit_date,
    externalId: customer.external_id,
    location:
      typeof customer.metadata?.location === "string" ? customer.metadata.location : null,
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="secondary"
        disabled={voiceMutation.isPending}
        onClick={() => voiceMutation.mutate()}
      >
        {voiceMutation.isPending ? "Starting call…" : "Start voice call"}
      </Button>
      {voiceMutation.isSuccess ? (
        <span className="self-center text-xs text-muted-foreground">Call queued</span>
      ) : null}
      {voiceMutation.isError ? (
        <span className="self-center text-xs text-destructive">
          {voiceMutation.error instanceof Error ? voiceMutation.error.message : "Call failed"}
        </span>
      ) : null}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            initialValues={initialValues}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {customer.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-deletes the customer. They will no longer appear in your list or receive
              outreach.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
