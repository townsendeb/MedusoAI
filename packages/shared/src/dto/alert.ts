import { z } from "zod";
import { ALERT_STATUSES } from "../enums";

export const updateAlertSchema = z.object({
  status: z.enum(ALERT_STATUSES),
});

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
