import { z } from "zod";

export const todoTitleSchema = z
  .string()
  .trim()
  .min(1, "Todo can't be empty.")
  .max(200, "Keep it under 200 characters.");

export const todoIdSchema = z.cuid("Invalid todo id.");
