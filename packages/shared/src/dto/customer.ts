import { z } from "zod";
import { phoneE164Schema } from "./zod-helpers";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: phoneE164Schema,
  email: z.string().trim().email().optional().nullable(),
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "visitDate must be YYYY-MM-DD")
    .optional()
    .nullable(),
  location: z.string().trim().min(1).max(120).optional().nullable(),
  externalId: z.string().trim().min(1).max(200).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
