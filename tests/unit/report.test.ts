import { describe, it, expect } from "vitest";

describe("Executive Analytics & Report Calculations", () => {
  it("should calculate Average Order Value (AOV) correctly", () => {
    const orders = [
      { total: 15000 },
      { total: 25000 },
      { total: 8000 },
      { total: 12000 },
    ];

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const aov = Math.round(totalRevenue / orders.length);

    expect(totalRevenue).toBe(60000);
    expect(aov).toBe(15000);
  });

  it("should calculate repeat customer retention rate percentage", () => {
    const totalCustomers = 50;
    const repeatCustomers = 18;

    const repeatRate = Math.round((repeatCustomers / totalCustomers) * 100);
    expect(repeatRate).toBe(36);
  });

  it("should group revenue by daily time-series dates", () => {
    const payments = [
      { amount: 5000, date: "2026-09-01" },
      { amount: 3000, date: "2026-09-01" },
      { amount: 7000, date: "2026-09-02" },
    ];

    const map = new Map<string, number>();
    payments.forEach((p) => {
      const cur = map.get(p.date) || 0;
      map.set(p.date, cur + p.amount);
    });

    expect(map.get("2026-09-01")).toBe(8000);
    expect(map.get("2026-09-02")).toBe(7000);
  });
});
