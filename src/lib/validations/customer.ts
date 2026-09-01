import { z } from "zod";
import { phoneSchema, emailSchema, instagramUsernameSchema, pincodeSchema } from "./common";

/**
 * Customer validation schemas.
 */

export const customerCreateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  preferredName: z.string().trim().max(50).optional().or(z.literal("")),
  phone: phoneSchema,
  whatsappNumber: phoneSchema,
  instagramUsername: instagramUsernameSchema,
  email: emailSchema,
  dateOfBirth: z.coerce.date().optional().nullable(),
  anniversary: z.coerce.date().optional().nullable(),
  preferredChannel: z
    .enum(["INSTAGRAM", "WHATSAPP", "WALK_IN", "REFERRAL", "PHONE", "WEBSITE", "OTHER"])
    .default("WHATSAPP"),
  source: z
    .enum(["INSTAGRAM", "WHATSAPP", "WALK_IN", "REFERRAL", "PHONE", "WEBSITE", "OTHER"])
    .default("WALK_IN"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  addresses: z.array(
    z.object({
      label: z.string().trim().default("Home"),
      line1: z.string().trim().min(1, "Address line 1 is required"),
      line2: z.string().trim().optional().or(z.literal("")),
      city: z.string().trim().min(1, "City is required"),
      state: z.string().trim().optional().or(z.literal("")),
      pincode: pincodeSchema,
      isDefault: z.boolean().default(false),
    })
  ).optional().default([]),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customerSearchSchema = z.object({
  search: z.string().trim().optional(),
  source: z
    .enum(["INSTAGRAM", "WHATSAPP", "WALK_IN", "REFERRAL", "PHONE", "WEBSITE", "OTHER"])
    .optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["fullName", "createdAt", "totalOrders", "totalLifetimeValue", "lastInteractionAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;
