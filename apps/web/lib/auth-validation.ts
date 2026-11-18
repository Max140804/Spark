import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(12)
  .max(72)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72);

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["PARENT", "TEACHER"]),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmationSchema = z.object({
  token: z.string().min(32).max(128),
  password: passwordSchema,
});

export const verificationTokenSchema = z.object({
  token: z.string().min(32).max(128),
});
