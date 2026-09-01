import { describe, it, expect } from "vitest";
import { OrderStatus, Priority } from "@prisma/client";

describe("Production Pipeline & Tailor Capacity Calculations", () => {
  it("should accurately calculate tailor workload and utilization percentage", () => {
    const activeOrders = [
      {
        id: "ord-1",
        status: OrderStatus.CUTTING,
        priority: Priority.URGENT,
        items: [{ quantity: 2 }, { quantity: 1 }],
      },
      {
        id: "ord-2",
        status: OrderStatus.STITCHING,
        priority: Priority.MEDIUM,
        items: [{ quantity: 3 }],
      },
    ];

    const totalGarments = activeOrders.reduce(
      (acc, order) => acc + order.items.reduce((sum, i) => sum + i.quantity, 0),
      0
    );

    const maxCapacity = 8;
    const utilizationPercent = Math.min(100, Math.round((totalGarments / maxCapacity) * 100));
    const urgentCount = activeOrders.filter((o) => o.priority === Priority.URGENT).length;

    expect(totalGarments).toBe(6);
    expect(utilizationPercent).toBe(75);
    expect(urgentCount).toBe(1);
  });

  it("should correctly determine next production stage in workflow", () => {
    const getNextStage = (status: OrderStatus): OrderStatus | null => {
      switch (status) {
        case "CONFIRMED":
        case "MEASUREMENT_PENDING":
          return OrderStatus.CUTTING;
        case "CUTTING":
          return OrderStatus.STITCHING;
        case "STITCHING":
        case "ALTERATION":
          return OrderStatus.FINISHING;
        case "FINISHING":
          return OrderStatus.QUALITY_CHECK;
        case "QUALITY_CHECK":
          return OrderStatus.READY;
        default:
          return null;
      }
    };

    expect(getNextStage(OrderStatus.MEASUREMENT_PENDING)).toBe(OrderStatus.CUTTING);
    expect(getNextStage(OrderStatus.CUTTING)).toBe(OrderStatus.STITCHING);
    expect(getNextStage(OrderStatus.STITCHING)).toBe(OrderStatus.FINISHING);
    expect(getNextStage(OrderStatus.FINISHING)).toBe(OrderStatus.QUALITY_CHECK);
    expect(getNextStage(OrderStatus.QUALITY_CHECK)).toBe(OrderStatus.READY);
    expect(getNextStage(OrderStatus.READY)).toBe(null);
  });
});
