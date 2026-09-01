import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "Variant SKU is required"),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  price: z.coerce.number().positive("Price must be greater than 0").optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url("Valid image URL required"),
  altText: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const productCreateSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters").toUpperCase(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  collection: z.string().optional().nullable(), // "Bridal 2026", "Aari Works", "Silk Festive"
  price: z.coerce.number().positive("Selling price must be greater than 0"),
  costPrice: z.coerce.number().positive().optional().nullable(),
  salePrice: z.coerce.number().positive().optional().nullable(),
  availableQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  fabric: z.string().optional().nullable(), // "Raw Silk", "Organza", "Velvet", "Georgette", "Banarasi"
  color: z.string().optional().nullable(),
  sizeOptions: z.array(z.string()).default([]),
  isCustomizable: z.boolean().default(true),
  isActive: z.boolean().default(true),
  images: z.array(productImageSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().optional(),
});

export const productSearchSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  collection: z.string().optional(),
  fabric: z.string().optional(),
  isCustomizable: z.enum(["true", "false"]).optional(),
  stockStatus: z.enum(["all", "in_stock", "low_stock", "out_of_stock"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["name", "price", "availableQuantity", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
