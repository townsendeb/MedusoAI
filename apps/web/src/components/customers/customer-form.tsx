"use client";

import { useState } from "react";
import { createCustomerSchema, type CreateCustomerInput } from "@meduso/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CustomerFormValues = CreateCustomerInput;

type CustomerFormProps = {
  initialValues?: Partial<CustomerFormValues>;
  submitLabel: string;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
};

const EMPTY: CustomerFormValues = {
  name: "",
  phone: "",
  email: null,
  visitDate: null,
  location: null,
  externalId: null,
};

export function CustomerForm({ initialValues, submitLabel, onSubmit }: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>({ ...EMPTY, ...initialValues });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = createCustomerSchema.safeParse({
      ...values,
      email: values.email || null,
      visitDate: values.visitDate || null,
      location: values.location || null,
      externalId: values.externalId || null,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          required
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          placeholder="+15551234567 or (555) 123-4567"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          value={values.email ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value || null }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="visitDate">Last visit date (optional)</Label>
        <Input
          id="visitDate"
          type="date"
          value={values.visitDate ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, visitDate: e.target.value || null }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          value={values.location ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, location: e.target.value || null }))}
          placeholder="Downtown"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="externalId">External ID (optional)</Label>
        <Input
          id="externalId"
          value={values.externalId ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, externalId: e.target.value || null }))}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
