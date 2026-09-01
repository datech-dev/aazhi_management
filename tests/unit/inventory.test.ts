import { describe, it, expect } from "vitest";
import {
  inventoryItemCreateSchema,
  stockAdjustmentSchema,
  inventorySearchSchema,
} from "@/lib/validations/inventory";

describe("Inventory Ledger Validation & Business Logic", () => {
  it("should validate raw fabric item with meters unit", () => {
    const validFabric = {
      name: "Pure Banarasi Brocade - Crimson Red",
      sku: "FAB-BAN-001",
      type: "FABRIC" as const,
      unit: "meters",
      quantity: 25.5,
      reorderThreshold: 5.0,
      costPerUnit: 650,
      location: "Rack 3, Shelf B",
    };

    const parsed = inventoryItemCreateSchema.safeParse(validFabric);
    expect(parsed.success).toBe(true);
  });

  it("should validate stock adjustment transaction", () => {
    const validAdjustment = {
      inventoryItemId: "item-12345",
      type: "STOCK_IN" as const,
      quantity: 10.5,
      reference: "PO-2026-AUG-12",
      notes: "New silk roll received from Surat vendor",
    };

    const parsed = stockAdjustmentSchema.safeParse(validAdjustment);
    expect(parsed.success).toBe(true);
  });

  it("should reject negative adjustment quantity", () => {
    const invalidAdjustment = {
      inventoryItemId: "item-12345",
      type: "STOCK_IN" as const,
      quantity: -5,
    };

    const parsed = stockAdjustmentSchema.safeParse(invalidAdjustment);
    expect(parsed.success).toBe(false);
  });
});
