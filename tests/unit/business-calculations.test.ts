import { describe, it, expect } from "vitest";
import { addMoney, subtractMoney, formatCurrency, isValidIndianPhone, formatPhone } from "@/lib/utils";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/constants";

describe("Financial and Currency Calculations", () => {
  it("correctly adds money without floating point drift", () => {
    const total = addMoney(1999.99, 500.50, 0.01);
    expect(total).toBe(2500.50);
  });

  it("correctly subtracts money for order balance", () => {
    const balance = subtractMoney(12500.00, 6000.00);
    expect(balance).toBe(6500.00);
  });

  it("formats Indian Rupee (INR) currency strings properly", () => {
    expect(formatCurrency(12500)).toContain("12,500");
    expect(formatCurrency(150000)).toContain("1,50,000");
  });
});

describe("Indian Phone Number Formatting & Validation", () => {
  it("validates valid 10-digit Indian mobile numbers", () => {
    expect(isValidIndianPhone("9876543210")).toBe(true);
    expect(isValidIndianPhone("+91 9840123456")).toBe(true);
    expect(isValidIndianPhone("918870123456")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(isValidIndianPhone("12345")).toBe(false);
    expect(isValidIndianPhone("4567890123")).toBe(false); // Does not start with 6-9
  });

  it("formats clean display phone numbers", () => {
    expect(formatPhone("9840123456")).toBe("+91 98401 23456");
  });
});

describe("Order Workflow Status Transitions", () => {
  it("allows valid transitions from CONFIRMED", () => {
    const allowed = ORDER_STATUS_TRANSITIONS["CONFIRMED"];
    expect(allowed).toContain("MEASUREMENT_PENDING");
    expect(allowed).toContain("CUTTING");
    expect(allowed).toContain("CANCELLED");
  });

  it("disallows invalid transitions from COMPLETED", () => {
    const allowed = ORDER_STATUS_TRANSITIONS["COMPLETED"];
    expect(allowed).toHaveLength(0);
  });
});
