import { describe, it, expect } from "vitest";
import { PaymentStatus } from "@prisma/client";

describe("Payment & Financial Ledger Calculations", () => {
  it("should correctly compute balance remaining and payment status", () => {
    const orderTotal = 15000;

    // Helper for status transition
    const calculatePaymentState = (totalPaid: number) => {
      const balance = Math.max(0, orderTotal - totalPaid);
      let status = PaymentStatus.UNPAID;

      if (totalPaid >= orderTotal && orderTotal > 0) {
        status = PaymentStatus.FULLY_PAID;
      } else if (totalPaid > 0) {
        status = PaymentStatus.PARTIALLY_PAID;
      }

      return { balance, status };
    };

    const initial = calculatePaymentState(0);
    expect(initial.balance).toBe(15000);
    expect(initial.status).toBe(PaymentStatus.UNPAID);

    const advance = calculatePaymentState(5000);
    expect(advance.balance).toBe(10000);
    expect(advance.status).toBe(PaymentStatus.PARTIALLY_PAID);

    const full = calculatePaymentState(15000);
    expect(full.balance).toBe(0);
    expect(full.status).toBe(PaymentStatus.FULLY_PAID);
  });

  it("should calculate revenue breakdown by payment method", () => {
    const payments = [
      { amount: 5000, method: "UPI" },
      { amount: 3000, method: "CASH" },
      { amount: 2000, method: "UPI" },
      { amount: 4000, method: "CARD" },
      { amount: 1500, method: "BANK_TRANSFER" },
    ];

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    const byMethod = {
      UPI: payments.filter((p) => p.method === "UPI").reduce((sum, p) => sum + p.amount, 0),
      CASH: payments.filter((p) => p.method === "CASH").reduce((sum, p) => sum + p.amount, 0),
      CARD: payments.filter((p) => p.method === "CARD").reduce((sum, p) => sum + p.amount, 0),
      BANK_TRANSFER: payments.filter((p) => p.method === "BANK_TRANSFER").reduce((sum, p) => sum + p.amount, 0),
    };

    expect(totalCollected).toBe(15500);
    expect(byMethod.UPI).toBe(7000);
    expect(byMethod.CASH).toBe(3000);
    expect(byMethod.CARD).toBe(4000);
    expect(byMethod.BANK_TRANSFER).toBe(1500);
  });

  it("should handle voiding payment balance restoration", () => {
    const orderTotal = 10000;
    let activePayments = [
      { id: "p1", amount: 4000, isVoided: false },
      { id: "p2", amount: 6000, isVoided: false },
    ];

    let totalPaid = activePayments.filter((p) => !p.isVoided).reduce((s, p) => s + p.amount, 0);
    expect(totalPaid).toBe(10000);
    expect(orderTotal - totalPaid).toBe(0);

    // Void p2
    activePayments[1].isVoided = true;
    totalPaid = activePayments.filter((p) => !p.isVoided).reduce((s, p) => s + p.amount, 0);
    expect(totalPaid).toBe(4000);
    expect(orderTotal - totalPaid).toBe(6000);
  });
});
