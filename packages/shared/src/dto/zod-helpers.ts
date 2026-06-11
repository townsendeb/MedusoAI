import { z } from "zod";

/** E.164 phone number: + followed by 1–15 digits */
export const phoneE164Schema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{1,14}$/, "Phone must be in E.164 format (e.g. +15551234567)");

export const uuidSchema = z.string().uuid();

export function zodEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values);
}
