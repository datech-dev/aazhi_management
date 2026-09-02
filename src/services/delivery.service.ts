import { prisma } from "@/lib/prisma";
import { DeliveryStatus, DeliveryMethod, OrderStatus } from "@prisma/client";
import { logAudit } from "./audit.service";

/**
 * Delivery & Dispatch Logistics Service
 */

export interface DeliveryFilterInput {
  status?: DeliveryStatus;
  deliveryMethod?: DeliveryMethod;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ScheduleDeliveryInput {
  orderId: string;
  customerId: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  scheduledDate?: Date;
  trackingNumber?: string;
  courierName?: string;
  deliveryNotes?: string;
}

export async function scheduleDelivery(data: ScheduleDeliveryInput, actorId: string) {
  const {
    orderId,
    customerId,
    deliveryMethod,
    address,
    scheduledDate,
    trackingNumber,
    courierName,
    deliveryNotes,
  } = data;

  const existingDelivery = await prisma.delivery.findUnique({
    where: { orderId },
  });

  if (existingDelivery) {
    const updated = await prisma.delivery.update({
      where: { orderId },
      data: {
        deliveryMethod,
        address,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        trackingNumber,
        courierName,
        deliveryNotes,
        status: DeliveryStatus.SCHEDULED,
      },
    });

    await logAudit({
      userId: actorId,
      action: "delivery_updated",
      entityType: "delivery",
      entityId: updated.id,
      newValue: { deliveryMethod, status: DeliveryStatus.SCHEDULED },
    });

    return updated;
  }

  const delivery = await prisma.delivery.create({
    data: {
      orderId,
      customerId,
      deliveryMethod,
      address,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      trackingNumber,
      courierName,
      deliveryNotes,
      status: DeliveryStatus.SCHEDULED,
    },
  });

  await logAudit({
    userId: actorId,
    action: "delivery_scheduled",
    entityType: "delivery",
    entityId: delivery.id,
    newValue: { deliveryMethod, orderId },
  });

  return delivery;
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
  trackingNumber?: string,
  courierName?: string,
  notes?: string,
  actorId?: string
) {
  return await prisma.$transaction(async (tx) => {
    const delivery = await tx.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!delivery) {
      throw new Error("Delivery record not found");
    }

    const isDelivered = status === DeliveryStatus.DELIVERED;
    const deliveredDate = isDelivered ? new Date() : delivery.deliveredDate;

    const updatedDelivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: {
        status,
        deliveredDate,
        ...(trackingNumber ? { trackingNumber } : {}),
        ...(courierName ? { courierName } : {}),
        ...(notes ? { deliveryNotes: notes } : {}),
      },
    });

    // If marked as DELIVERED, automatically complete or update the parent order status
    if (isDelivered) {
      await tx.order.update({
        where: { id: delivery.orderId },
        data: {
          status: OrderStatus.COMPLETED,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          fromStatus: delivery.order.status,
          toStatus: OrderStatus.COMPLETED,
          changedBy: actorId || null,
          notes: `Order completed via Delivery dispatch (${delivery.deliveryMethod})`,
        },
      });
    }

    if (actorId) {
      await logAudit({
        userId: actorId,
        action: "delivery_status_changed",
        entityType: "delivery",
        entityId: deliveryId,
        oldValue: { status: delivery.status },
        newValue: { status, trackingNumber },
      });
    }

    return updatedDelivery;
  });
}

export async function getDeliveriesList(input: DeliveryFilterInput = {}) {
  const { status, deliveryMethod, search, page = 1, pageSize = 20 } = input;

  const where = {
    ...(status ? { status } : {}),
    ...(deliveryMethod ? { deliveryMethod } : {}),
    ...(search
      ? {
          OR: [
            { trackingNumber: { contains: search, mode: "insensitive" as const } },
            { courierName: { contains: search, mode: "insensitive" as const } },
            { order: { orderNumber: { contains: search, mode: "insensitive" as const } } },
            { customer: { fullName: { contains: search, mode: "insensitive" as const } } },
            { customer: { phone: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.delivery.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            balance: true,
            status: true,
            expectedDeliveryDate: true,
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            whatsappNumber: true,
          },
        },
      },
    }),
    prisma.delivery.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
