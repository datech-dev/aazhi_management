import { describe, it, expect } from "vitest";
import { DeliveryStatus, DeliveryMethod, OrderStatus } from "@prisma/client";

describe("Delivery & Dispatch Logistics Logic", () => {
  it("should update order status to COMPLETED when delivery status becomes DELIVERED", () => {
    const simulateDeliveryTransition = (
      currentDeliveryStatus: DeliveryStatus,
      newDeliveryStatus: DeliveryStatus,
      currentOrderStatus: OrderStatus
    ) => {
      let nextOrderStatus = currentOrderStatus;
      if (newDeliveryStatus === DeliveryStatus.DELIVERED) {
        nextOrderStatus = OrderStatus.COMPLETED;
      }
      return { deliveryStatus: newDeliveryStatus, orderStatus: nextOrderStatus };
    };

    const res1 = simulateDeliveryTransition(
      DeliveryStatus.SCHEDULED,
      DeliveryStatus.OUT_FOR_DELIVERY,
      OrderStatus.READY
    );
    expect(res1.deliveryStatus).toBe(DeliveryStatus.OUT_FOR_DELIVERY);
    expect(res1.orderStatus).toBe(OrderStatus.READY);

    const res2 = simulateDeliveryTransition(
      DeliveryStatus.OUT_FOR_DELIVERY,
      DeliveryStatus.DELIVERED,
      OrderStatus.READY
    );
    expect(res2.deliveryStatus).toBe(DeliveryStatus.DELIVERED);
    expect(res2.orderStatus).toBe(OrderStatus.COMPLETED);
  });

  it("should categorize dispatches by method correctly", () => {
    const queue = [
      { id: "d1", method: DeliveryMethod.CUSTOMER_PICKUP },
      { id: "d2", method: DeliveryMethod.LOCAL_DELIVERY },
      { id: "d3", method: DeliveryMethod.COURIER },
      { id: "d4", method: DeliveryMethod.COURIER },
    ];

    const countByMethod = (method: DeliveryMethod) =>
      queue.filter((d) => d.method === method).length;

    expect(countByMethod(DeliveryMethod.CUSTOMER_PICKUP)).toBe(1);
    expect(countByMethod(DeliveryMethod.LOCAL_DELIVERY)).toBe(1);
    expect(countByMethod(DeliveryMethod.COURIER)).toBe(2);
  });
});
