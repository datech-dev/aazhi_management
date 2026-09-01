import { z } from "zod";
import { moneyStringSchema } from "./common";

/**
 * Order validation schemas.
 */

export const orderItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: moneyStringSchema,
  customizations: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const orderCreateSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  salespersonId: z.string().optional().nullable(),
  assignedTailorId: z.string().optional().nullable(),
  source: z
    .enum(["INSTAGRAM", "WHATSAPP", "WALK_IN", "REFERRAL", "PHONE", "WEBSITE", "OTHER"])
    .default("WALK_IN"),
  expectedDeliveryDate: z.coerce.date().optional().nullable(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  discountAmount: moneyStringSchema.optional().default(0),
  discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  taxPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  internalNotes: z.string().trim().max(2000).optional().or(z.literal("")),
  quotationId: z.string().optional().nullable(),
});

export const orderUpdateSchema = z.object({
  salespersonId: z.string().optional().nullable(),
  assignedTailorId: z.string().optional().nullable(),
  expectedDeliveryDate: z.coerce.date().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  notes: z.string().trim().max(2000).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "DRAFT", "CONFIRMED", "MEASUREMENT_PENDING", "CUTTING",
    "STITCHING", "FINISHING", "QUALITY_CHECK", "ALTERATION",
    "READY", "DELIVERED", "COMPLETED", "CANCELLED",
  ]),
  notes: z.string().trim().optional(),
});

export const orderSearchSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum([
    "DRAFT", "CONFIRMED", "MEASUREMENT_PENDING", "CUTTING",
    "STITCHING", "FINISHING", "QUALITY_CHECK", "ALTERATION",
    "READY", "DELIVERED", "COMPLETED", "CANCELLED",
  ]).optional(),
  paymentStatus: z.enum(["UNPAID", "ADVANCE_PAID", "PARTIALLY_PAID", "FULLY_PAID", "REFUNDED"]).optional(),
  customerId: z.string().optional(),
  assignedTailorId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["orderNumber", "orderDate", "expectedDeliveryDate", "total", "status", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type OrderSearchInput = z.infer<typeof orderSearchSchema>;
