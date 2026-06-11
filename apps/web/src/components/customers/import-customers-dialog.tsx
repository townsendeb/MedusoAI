"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadAndImportCustomers } from "@/lib/imports/mutations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ImportCustomersDialogProps = {
  organizationId: string;
  trigger?: React.ReactNode;
  onImportStarted?: (importId: string) => void;
};

export function ImportCustomersDialog({
  organizationId,
  trigger,
  onImportStarted,
}: ImportCustomersDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadAndImportCustomers(organizationId, file),
    onSuccess: (result) => {
      setError(null);
      onImportStarted?.(result.importId);
      setOpen(false);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Import failed");
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        {trigger ?? <Button variant="outline">Import CSV</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import customers</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns: Name, Phone, Email (optional), Visit Date (optional),
            Location (optional).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            disabled={mutation.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              mutation.mutate(file);
            }}
          />
          {mutation.isPending ? (
            <p className="text-sm text-muted-foreground">Uploading and starting import…</p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
