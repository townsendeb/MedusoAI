"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_KEY_SCOPES, type ApiKeyScope } from "@meduso/shared";
import { createApiKey, revokeApiKey } from "@/lib/api-keys/mutations";
import { fetchApiKeys } from "@/lib/api-keys/queries";
import { formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SCOPE_LABELS: Record<ApiKeyScope, string> = {
  "customers:read": "Read customers",
  "customers:write": "Write customers",
};

type ApiKeysManagerProps = {
  organizationId: string;
};

export function ApiKeysManager({ organizationId }: ApiKeysManagerProps) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<ApiKeyScope[]>(["customers:write"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.apiKeys.all(organizationId),
    queryFn: fetchApiKeys,
  });

  const createMutation = useMutation({
    mutationFn: () => createApiKey(organizationId, { name, scopes }),
    onSuccess: (result) => {
      setCreatedKey(result.rawKey);
      setName("");
      setScopes(["customers:write"]);
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(organizationId) });
    },
    onError: (err) => {
      setFormError(err instanceof Error ? err.message : "Failed to create API key");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all(organizationId) });
    },
  });

  function setScopeEnabled(scope: ApiKeyScope, enabled: boolean) {
    setScopes((current) =>
      enabled
        ? current.includes(scope)
          ? current
          : [...current, scope]
        : current.filter((s) => s !== scope),
    );
  }

  function handleCreateOpenChange(open: boolean) {
    setCreateOpen(open);
    if (!open) {
      setCreatedKey(null);
      setFormError(null);
    }
  }

  async function copyCreatedKey() {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          API keys authenticate Zapier and custom integrations. Keys are shown once at creation.
        </p>
        <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
          <DialogTrigger>
            <Button>Create API key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>
                Use this key in the <code className="text-xs">X-Api-Key</code> header.
              </DialogDescription>
            </DialogHeader>
            {createdKey ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Copy this key now. You won&apos;t be able to see it again.
                </p>
                <code className="block break-all rounded-lg bg-muted p-3 text-sm">{createdKey}</code>
                <div className="flex gap-2">
                  <Button onClick={copyCreatedKey}>Copy key</Button>
                  <Button variant="outline" onClick={() => handleCreateOpenChange(false)}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormError(null);
                  if (!name.trim()) {
                    setFormError("Name is required");
                    return;
                  }
                  if (scopes.length === 0) {
                    setFormError("Select at least one scope");
                    return;
                  }
                  createMutation.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="key-name">Name</Label>
                  <Input
                    id="key-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Zapier Production"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  {API_KEY_SCOPES.map((scope) => (
                    <label key={scope} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={scopes.includes(scope)}
                        onCheckedChange={(checked) => setScopeEnabled(scope, checked === true)}
                      />
                      {SCOPE_LABELS[scope]}
                    </label>
                  ))}
                </div>
                {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating…" : "Create key"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load API keys"}
        </p>
      ) : !data?.length ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No API keys yet. Create one for Zapier or your CRM integration.
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="text-xs">{key.key_prefix}…</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((scope) => (
                        <Badge key={scope} variant="secondary">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(key.last_used_at)}
                  </TableCell>
                  <TableCell>
                    {key.revoked_at ? (
                      <Badge variant="outline">Revoked</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!key.revoked_at ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={revokeMutation.isPending}
                        onClick={() => revokeMutation.mutate(key.id)}
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
