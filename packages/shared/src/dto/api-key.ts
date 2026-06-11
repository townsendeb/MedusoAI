import { z } from "zod";
import { API_KEY_SCOPES } from "../enums";

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(120),
  scopes: z.array(z.enum(API_KEY_SCOPES)).min(1),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
