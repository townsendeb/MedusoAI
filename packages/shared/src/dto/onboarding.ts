import { z } from "zod";

export const onboardingSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  name: z.string().trim().min(1).max(120).optional(),
  timezone: z.string().trim().min(1).max(64),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
