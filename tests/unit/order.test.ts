import { describe, it, expect } from "vitest";
import {
  orderCreateSchema,
  orderStatusUpdateSchema,
  quotationCreateSchema,
  orderPaymentRecordSchema,
} from "@/lib/validations/order";

describe("Orders & Multi-Item Booking Engine Validation", () => {
  it("should validate a complete multi-item custom tailoring order with advance payment", () => {
    const validOrder = {
      customerId: "cust-12345",
      priority: "HIGH" as const,
      deliveryType: "STORE_PICKUP",
      expectedTrialDate: new Date("2026-09-10"),
      expectedDeliveryDate: new Date("2026-09-15"),
      taxRate: 5,
      discountAmount: 200,
      items: [
        {
          name: "Bridal Silk Blouse with Hand Aari Work",
          itemType: "CUSTOM_TAILORING" as const,
          fabricSource: "CUSTOMER_PROVIDED" as const,
          unitPrice: 5500,
          quantity: 1,
          discountAmount: 0,
          taxRate: 5,
        },
        {
          name: "Raw Silk Kali Lehenga Skirt",
          itemType: "CUSTOM_TAILORING" as const,
          fabricSource: "IN_HOUSE" as const,
          unitPrice: 12000,
          quantity: 1,
          discountAmount: 0,
          taxRate: 5,
        },
      ],
      advancePayment: {
        amount: 5000,
        method: "UPI" as const,
        referenceNumber: "UPI/20260902/123456",
        notes: "GPay advance received",
      },
    };

    const parsed = orderCreateSchema.safeParse(validOrder);
    expect(parsed.success).toBe(true);
  });

  it("should reject order with empty items array", () => {
    const invalidOrder = {
      customerId: "cust-12345",
      items: [],
    };

    const parsed = orderCreateSchema.safeParse(invalidOrder);
    expect(parsed.success).toBe(false);
  });

  it("should validate order lifecycle status transitions", () => {
    const statusUpdate = {
      status: "CUTTING" as const,
      notes: "Fabric sent to master cutter. Lining pre-washed.",
    };

    const parsed = orderStatusUpdateSchema.safeParse(statusUpdate);
    expect(parsed.success).toBe(true);
  });

  it("should validate order payment recording", () => {
    const payment = {
      orderId: "ord-123",
      amount: 4500,
      method: "CASH" as const,
      type: "MILESTONE" as const,
      notes: "Trial fitting approval payment",
    };

    const parsed = orderPaymentRecordSchema.safeParse(payment);
    expect(parsed.success).toBe(true);
  });

  it("should validate quotation creation with items", () => {
    const quotation = {
      customerId: "cust-999",
      validUntil: new Date("2026-09-30"),
      taxPercent: 5,
      items: [
        {
          description: "Festive Anarkali Suit Set",
          unitPrice: 8500,
          quantity: 1,
        },
      ],
    };

    const parsed = quotationCreateSchema.safeParse(quotation);
    expect(parsed.success).toBe(true);
  });
});
