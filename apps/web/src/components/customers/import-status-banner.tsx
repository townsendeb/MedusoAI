"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ImportStatus } from "@meduso/shared";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { fetchCustomerImport } from "@/lib/imports/queries";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const POLL_MS = 2000;

type RowError = { row: number; error: string };

type ErrorReport = {
  message?: string;
  rows?: RowError[];
};

type ImportStatusBannerProps = {
  organizationId: string;
  importId: string;
  onComplete: () => void;
  onStatusChange?: (status: ImportStatus) => void;
};

function formatImportMessage(
  status: ImportStatus,
  fileName: string | null,
  successRows: number,
  failedRows: number,
  errorReport: ErrorReport | null,
): string {
  const fileLabel = fileName ?? "CSV file";

  if (status === "PROCESSING") {
    return `Importing ${fileLabel}…`;
  }

  if (status === "COMPLETED") {
    const parts = [`Imported ${successRows} customer${successRows === 1 ? "" : "s"}.`];
    if (failedRows > 0) {
      parts.push(`${failedRows} row${failedRows === 1 ? "" : "s"} skipped.`);
    }
    return parts.join(" ");
  }

  return (
    errorReport?.message ??
    `Import failed. ${failedRows} row${failedRows === 1 ? "" : "s"} could not be imported.`
  );
}

export function ImportStatusBanner({
  organizationId,
  importId,
  onComplete,
  onStatusChange,
}: ImportStatusBannerProps) {
  const queryClient = useQueryClient();

  const { data: importJob } = useQuery({
    queryKey: queryKeys.imports.detail(organizationId, importId),
    queryFn: () => fetchCustomerImport(importId),
    refetchInterval: (query) =>
      query.state.data?.status === "PROCESSING" ? POLL_MS : false,
  });

  useEffect(() => {
    if (!importJob) {
      return;
    }

    onStatusChange?.(importJob.status);

    if (importJob.status !== "PROCESSING") {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.customers.all(organizationId),
      });
    }
  }, [importJob, onStatusChange, organizationId, queryClient]);

  if (!importJob) {
    return null;
  }

  const isProcessing = importJob.status === "PROCESSING";
  const isSuccess = importJob.status === "COMPLETED";
  const isFailed = importJob.status === "FAILED";
  const errorReport = importJob.error_report as ErrorReport | null;
  const rowErrors = errorReport?.rows ?? [];

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-xl border px-4 py-3",
        isProcessing && "border-border bg-muted/40",
        isSuccess && "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
        isFailed && "border-destructive/30 bg-destructive/5",
      )}
      role="status"
    >
      <div className="flex gap-3">
        {isProcessing ? (
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : isSuccess ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
        ) : (
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
        )}
        <div>
          <p className="text-sm font-medium">
            {formatImportMessage(
              importJob.status,
              importJob.file_name,
              importJob.success_rows,
              importJob.failed_rows,
              errorReport,
            )}
          </p>
          {isProcessing ? (
            <p className="text-sm text-muted-foreground">
              New customers will appear in the list automatically.
            </p>
          ) : null}
          {isFailed && rowErrors.length > 0 ? (
            <details className="mt-2 text-sm text-muted-foreground">
              <summary className="cursor-pointer">View row errors</summary>
              <ul className="mt-1 max-h-32 list-inside list-disc overflow-y-auto">
                {rowErrors.slice(0, 10).map((rowError) => (
                  <li key={rowError.row}>
                    Row {rowError.row}: {rowError.error}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {isSuccess && rowErrors.length > 0 ? (
            <details className="mt-2 text-sm text-muted-foreground">
              <summary className="cursor-pointer">View skipped rows</summary>
              <ul className="mt-1 max-h-32 list-inside list-disc overflow-y-auto">
                {rowErrors.slice(0, 10).map((rowError) => (
                  <li key={rowError.row}>
                    Row {rowError.row}: {rowError.error}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </div>
      {!isProcessing ? (
        <Button variant="ghost" size="sm" className="shrink-0" onClick={onComplete}>
          <X className="size-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      ) : null}
    </div>
  );
}
