import { z } from "zod";

export const orderStatusEnum = z.enum([
  "DRAFT",
  "CONFIRMED",
  "MEASUREMENT_PENDING",
  "CUTTING",
  "STITCHING",
  "FINISHING",
  "QUALITY_CHECK",
  "ALTERATION",
  "READY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
]);

export const paymentStatusEnum = z.enum([
  "UNPAID",
  "ADVANCE_PAID",
  "PARTIALLY_PAID",
  "FULLY_PAID",
  "REFUNDED",
]);

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const paymentMethodEnum = z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "STORE_CREDIT"]);

export const orderItemCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Item description is required"), // e.g. "Bridal Silk Blouse with Hand Aari Work"
  productId: z.string().optional().nullable(),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
  quantity: z.coerce.number().int().positive().default(1),
  customizations: z.string().optional().nullable(),
  measurementProfileId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const orderCreateSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  branchId: z.string().optional().nullable(),
  salespersonId: z.string().optional().nullable(),
  priority: priorityEnum.default("MEDIUM"),
  expectedDeliveryDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  taxPercent: z.coerce.number().min(0).default(5),
  discountAmount: z.coerce.number().min(0).default(0),
  items: z.array(orderItemCreateSchema).min(1, "At least one item is required to create an order"),
  advancePayment: z
    .object({
      amount: z.coerce.number().min(0),
      method: paymentMethodEnum.default("UPI"),
      referenceNumber: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })
    .optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: orderStatusEnum,
  notes: z.string().optional().nullable(),
});

export const orderPaymentRecordSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  method: paymentMethodEnum.default("UPI"),
  type: z.enum(["ADVANCE", "MILESTONE", "FINAL_SETTLEMENT", "REFUND"]).default("MILESTONE"),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const quotationItemCreateSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  productId: z.string().optional().nullable(),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
  quantity: z.coerce.number().int().positive().default(1),
  notes: z.string().optional().nullable(),
});

export const quotationCreateSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  validUntil: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  taxPercent: z.coerce.number().min(0).default(5),
  discountAmount: z.coerce.number().min(0).default(0),
  items: z.array(quotationItemCreateSchema).min(1, "At least one item is required for a quotation"),
});

export const orderSearchSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  paymentStatus: z.string().optional(),
  customerId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "expectedDeliveryDate", "total"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type OrderItemCreateInput = z.infer<typeof orderItemCreateSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type OrderPaymentRecordInput = z.infer<typeof orderPaymentRecordSchema>;
export type QuotationItemCreateInput = z.infer<typeof quotationItemCreateSchema>;
export type QuotationCreateInput = z.infer<typeof quotationCreateSchema>;
export type OrderSearchInput = z.infer<typeof orderSearchSchema>;
