import { z } from "zod";
import { moneyStringSchema } from "./common";

/**
 * Payment validation schemas.
 */

export const paymentCreateSchema = z.object({
  orderId: z.string().min(1, "Order is required"),
  customerId: z.string().min(1, "Customer is required"),
  amount: moneyStringSchema.pipe(z.number().positive("Amount must be greater than 0")),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"]),
  type: z.enum(["ADVANCE", "PARTIAL", "FINAL", "REFUND"]).default("PARTIAL"),
  referenceNumber: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const paymentSearchSchema = z.object({
  search: z.string().trim().optional(),
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  method: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"]).optional(),
  type: z.enum(["ADVANCE", "PARTIAL", "FINAL", "REFUND"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["paymentNumber", "amount", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentSearchInput = z.infer<typeof paymentSearchSchema>;
