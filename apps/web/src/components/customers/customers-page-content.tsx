"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CustomersList } from "@/components/customers/customers-list";
import { ImportCustomersDialog } from "@/components/customers/import-customers-dialog";
import { ImportStatusBanner } from "@/components/customers/import-status-banner";
import { Button } from "@/components/ui/button";
import { fetchProcessingCustomerImport } from "@/lib/imports/queries";
import {
  clearActiveImportId,
  getActiveImportId,
  setActiveImportId,
  subscribeToActiveImportChanges,
} from "@/lib/imports/storage";
import { queryKeys } from "@/lib/query-keys";

type CustomersPageContentProps = {
  organizationId: string;
};

export function CustomersPageContent({ organizationId }: CustomersPageContentProps) {
  const [startedImportId, setStartedImportId] = useState<string | null>(null);
  const [isImportProcessing, setIsImportProcessing] = useState(false);

  const storedImportId = useSyncExternalStore(
    subscribeToActiveImportChanges,
    () => getActiveImportId(organizationId),
    () => null,
  );

  const { data: processingImport } = useQuery({
    queryKey: queryKeys.imports.processing(organizationId),
    queryFn: () => fetchProcessingCustomerImport(organizationId),
    enabled: !storedImportId && !startedImportId,
    staleTime: 0,
  });

  const activeImportId =
    startedImportId ?? storedImportId ?? processingImport?.id ?? null;

  useEffect(() => {
    if (!storedImportId && processingImport?.id) {
      setActiveImportId(organizationId, processingImport.id);
    }
  }, [organizationId, processingImport?.id, storedImportId]);

  const handleImportStarted = useCallback(
    (importId: string) => {
      setActiveImportId(organizationId, importId);
      setStartedImportId(importId);
      setIsImportProcessing(true);
    },
    [organizationId],
  );

  const handleImportComplete = useCallback(() => {
    clearActiveImportId(organizationId);
    setStartedImportId(null);
    setIsImportProcessing(false);
  }, [organizationId]);

  const handleStatusChange = useCallback((status: "PROCESSING" | "COMPLETED" | "FAILED") => {
    setIsImportProcessing(status === "PROCESSING");
  }, []);

  return (
    <div className="space-y-6">
      {activeImportId ? (
        <ImportStatusBanner
          organizationId={organizationId}
          importId={activeImportId}
          onComplete={handleImportComplete}
          onStatusChange={handleStatusChange}
        />
      ) : null}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            People you&apos;ve imported for post-visit outreach and recovery.
          </p>
        </div>
        <div className="flex gap-2">
          <ImportCustomersDialog
            organizationId={organizationId}
            onImportStarted={handleImportStarted}
          />
          <Link href="/customers/new">
            <Button>Add customer</Button>
          </Link>
        </div>
      </div>
      <CustomersList
        organizationId={organizationId}
        refetchInterval={isImportProcessing ? 3000 : false}
        onImportStarted={handleImportStarted}
      />
    </div>
  );
}
