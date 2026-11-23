import { z } from "zod";

export const todoTitleSchema = z
  .string()
  .trim()
  .min(1, "Todo can't be empty.")
  .max(200, "Keep it under 200 characters.");

export const todoIdSchema = z.cuid("Invalid todo id.");

// Trim/lowercase first, then check the format (Zod runs steps in order).
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(100, "Keep your name under 100 characters."),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
});

// Log-in only checks shape. Length rules would hint at what's wrong with the
// password; Better Auth's check gives the single generic error instead.
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});
