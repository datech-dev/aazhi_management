import { z } from "zod";

export const inventoryItemTypeEnum = z.enum([
  "PRODUCT",
  "FABRIC",
  "LINING",
  "LACE",
  "BUTTONS",
  "ZIPPERS",
  "HOOKS",
  "THREADS",
  "EMBELLISHMENT",
  "OTHER",
]);

export const inventoryTransactionTypeEnum = z.enum([
  "STOCK_IN",
  "STOCK_OUT",
  "ADJUSTMENT",
  "RETURN",
  "DAMAGED",
]);

export const inventoryItemCreateSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters").toUpperCase(),
  type: inventoryItemTypeEnum.default("FABRIC"),
  unit: z.string().min(1, "Unit of measurement is required").default("meters"), // "meters", "pcs", "rolls", "packets"
  quantity: z.coerce.number().min(0, "Quantity cannot be negative").default(0),
  reorderThreshold: z.coerce.number().min(0).default(5),
  costPerUnit: z.coerce.number().positive("Cost per unit must be greater than 0").optional().nullable(),
  supplierId: z.string().optional().nullable(),
  location: z.string().optional().nullable(), // "Rack A-2", "Shelf 4", "Fabric Bin"
  isActive: z.boolean().default(true),
});

export const inventoryItemUpdateSchema = inventoryItemCreateSchema.partial().extend({
  id: z.string().optional(),
});

export const stockAdjustmentSchema = z.object({
  inventoryItemId: z.string().min(1, "Inventory item ID is required"),
  type: inventoryTransactionTypeEnum,
  quantity: z.coerce.number().positive("Adjustment quantity must be greater than 0"),
  unitCost: z.coerce.number().positive().optional().nullable(),
  reference: z.string().optional().nullable(), // PO number, Order ID, or reason
  notes: z.string().optional().nullable(),
});

export const inventorySearchSchema = z.object({
  search: z.string().optional(),
  type: inventoryItemTypeEnum.optional(),
  stockStatus: z.enum(["all", "in_stock", "low_stock", "out_of_stock"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["name", "sku", "quantity", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type InventoryItemCreateInput = z.infer<typeof inventoryItemCreateSchema>;
export type InventoryItemUpdateInput = z.infer<typeof inventoryItemUpdateSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type InventorySearchInput = z.infer<typeof inventorySearchSchema>;
