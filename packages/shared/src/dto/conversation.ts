import { z } from "zod";
import { RECOVERY_ACTION_TYPES } from "../enums";

export const recoveryActionSchema = z.object({
  action: z.enum(RECOVERY_ACTION_TYPES),
  note: z.string().trim().max(2000).optional().nullable(),
});

export type RecoveryActionInput = z.infer<typeof recoveryActionSchema>;

export const updateConversationRecoverySchema = z.object({
  recoveryStatus: z.enum(["OPEN", "IN_RECOVERY", "RECOVERED", "RESOLVED", "LOST"]).optional(),
  action: recoveryActionSchema.optional(),
});

export type UpdateConversationRecoveryInput = z.infer<typeof updateConversationRecoverySchema>;
