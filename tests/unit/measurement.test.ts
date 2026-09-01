import { describe, it, expect } from "vitest";
import {
  measurementTemplateCreateSchema,
  measurementProfileCreateSchema,
  measurementSearchSchema,
} from "@/lib/validations/measurement";

describe("Tailor Measurement Templates & Profiling Validation", () => {
  it("should validate a complete blouse measurement template with custom fields", () => {
    const validTemplate = {
      name: "Bridal Aari Work Blouse",
      category: "Tops",
      isActive: true,
      fields: [
        { name: "Bust", key: "bust", unit: "INCHES" as const, isRequired: true, sortOrder: 1 },
        { name: "Upper Bust", key: "upper_bust", unit: "INCHES" as const, isRequired: true, sortOrder: 2 },
        { name: "Waist", key: "waist", unit: "INCHES" as const, isRequired: true, sortOrder: 3 },
        { name: "Arm Hole", key: "arm_hole", unit: "INCHES" as const, isRequired: true, sortOrder: 4 },
        { name: "Sleeve Length", key: "sleeve_length", unit: "INCHES" as const, isRequired: true, sortOrder: 5 },
        { name: "Front Neck Depth", key: "front_neck_depth", unit: "INCHES" as const, isRequired: true, sortOrder: 6 },
        { name: "Back Neck Depth", key: "back_neck_depth", unit: "INCHES" as const, isRequired: true, sortOrder: 7 },
      ],
    };

    const parsed = measurementTemplateCreateSchema.safeParse(validTemplate);
    expect(parsed.success).toBe(true);
  });

  it("should validate client measurement profile with numeric values", () => {
    const validProfile = {
      customerId: "cust-12345",
      templateId: "tmpl-blouse",
      unit: "INCHES" as const,
      notes: "Princess cut with boat neck. Front hook closure.",
      values: [
        { fieldKey: "bust", value: 36.5 },
        { fieldKey: "waist", value: 30.0 },
        { fieldKey: "front_neck_depth", value: 7.5 },
        { fieldKey: "back_neck_depth", value: 10.0 },
      ],
    };

    const parsed = measurementProfileCreateSchema.safeParse(validProfile);
    expect(parsed.success).toBe(true);
  });

  it("should reject profile with missing required customer or template", () => {
    const invalidProfile = {
      unit: "INCHES",
      values: [{ fieldKey: "bust", value: 36 }],
    };

    const parsed = measurementProfileCreateSchema.safeParse(invalidProfile);
    expect(parsed.success).toBe(false);
  });

  it("should parse measurement search query parameters", () => {
    const query = {
      search: "priya",
      templateId: "tmpl-123",
      page: "1",
      pageSize: "20",
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    const parsed = measurementSearchSchema.safeParse(query);
    expect(parsed.success).toBe(true);
  });
});
