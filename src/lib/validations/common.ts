import { z } from "zod";

/**
 * Common reusable Zod schemas.
 */

// Indian phone number validation
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91|91)?[6-9]\d{9}$/, "Enter a valid Indian phone number")
  .optional()
  .or(z.literal(""));

// Required phone
export const phoneRequiredSchema = z
  .string()
  .trim()
  .regex(/^(\+91|91)?[6-9]\d{9}$/, "Enter a valid Indian phone number");

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .optional()
  .or(z.literal(""));

// Instagram username
export const instagramUsernameSchema = z
  .string()
  .trim()
  .regex(/^@?[a-zA-Z0-9._]{1,30}$/, "Enter a valid Instagram username")
  .optional()
  .or(z.literal(""));

// Money value (positive decimal)
export const moneySchema = z
  .number()
  .min(0, "Amount must be positive")
  .multipleOf(0.01, "Amount can have at most 2 decimal places");

// Money as string input (from forms)
export const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
  .transform((v) => parseFloat(v));

// Pincode
export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter a valid 6-digit pincode")
  .optional()
  .or(z.literal(""));

// Pagination query params
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Sort query params
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Search query param
export const searchSchema = z.object({
  search: z.string().trim().optional(),
});

// Date range filter
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ID parameter
export const idParamSchema = z.object({
  id: z.string().cuid(),
});
