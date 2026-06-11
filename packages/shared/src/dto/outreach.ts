import { z } from "zod";

export const updateOutreachSettingsSchema = z.object({
  smsDelayHours: z.number().int().min(0).max(168).optional(),
  smsTemplate: z.string().trim().min(1).max(1600).optional(),
  voiceEnabled: z.boolean().optional(),
  maxSmsTurns: z.number().int().min(1).max(20).optional(),
  quietHoursStart: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "quietHoursStart must be HH:MM")
    .nullable()
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "quietHoursEnd must be HH:MM")
    .nullable()
    .optional(),
});

export type UpdateOutreachSettingsInput = z.infer<typeof updateOutreachSettingsSchema>;
