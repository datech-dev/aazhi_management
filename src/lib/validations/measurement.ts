import { z } from "zod";

export const measurementUnitEnum = z.enum(["INCHES", "CENTIMETERS"]);

export const measurementFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Field name is required"), // e.g. "Bust", "Front Neck Depth"
  key: z.string().min(1, "Field key is required"), // e.g. "bust", "front_neck_depth"
  unit: measurementUnitEnum.default("INCHES"),
  isRequired: z.boolean().default(true),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const measurementTemplateCreateSchema = z.object({
  name: z.string().min(2, "Template name must be at least 2 characters"), // "Blouse", "Kurti", "Lehenga", "Gown"
  category: z.string().optional().nullable(), // "Tops", "Bottoms", "Full Dress"
  isActive: z.boolean().default(true),
  fields: z.array(measurementFieldSchema).min(1, "At least one measurement field is required"),
});

export const measurementTemplateUpdateSchema = measurementTemplateCreateSchema.partial().extend({
  id: z.string().optional(),
});

export const measurementValueSchema = z.object({
  fieldKey: z.string().min(1, "Field key is required"),
  value: z.coerce.number().min(0, "Value cannot be negative"),
});

export const measurementProfileCreateSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  templateId: z.string().min(1, "Measurement template is required"),
  unit: measurementUnitEnum.default("INCHES"),
  notes: z.string().optional().nullable(), // Special tailor cutting instructions
  orderId: z.string().optional().nullable(), // Optional linked order
  values: z.array(measurementValueSchema).min(1, "At least one measurement value is required"),
});

export const measurementProfileUpdateSchema = measurementProfileCreateSchema.partial().extend({
  id: z.string().optional(),
});

export const measurementSearchSchema = z.object({
  search: z.string().optional(),
  templateId: z.string().optional(),
  customerId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "version"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type MeasurementFieldInput = z.infer<typeof measurementFieldSchema>;
export type MeasurementTemplateCreateInput = z.infer<typeof measurementTemplateCreateSchema>;
export type MeasurementTemplateUpdateInput = z.infer<typeof measurementTemplateUpdateSchema>;
export type MeasurementValueInput = z.infer<typeof measurementValueSchema>;
export type MeasurementProfileCreateInput = z.infer<typeof measurementProfileCreateSchema>;
export type MeasurementProfileUpdateInput = z.infer<typeof measurementProfileUpdateSchema>;
export type MeasurementSearchInput = z.infer<typeof measurementSearchSchema>;
