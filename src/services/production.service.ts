import { prisma } from "@/lib/prisma";
import { OrderStatus, Priority, UserRole } from "@prisma/client";
import { logAudit } from "./audit.service";

export interface KanbanColumn {
  id: OrderStatus;
  title: string;
  description: string;
  color: string;
  orders: KanbanOrder[];
}

export interface KanbanOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: Priority;
  expectedDeliveryDate: Date | null;
  createdAt: Date;
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
    whatsappNumber: string | null;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    customizations: string | null;
  }[];
  assignedTailor: {
    id: string;
    name: string;
    email: string;
  } | null;
  measurementProfileId?: string | null;
}

const WORKSHOP_STAGES: {
  id: OrderStatus;
  title: string;
  description: string;
  color: string;
}[] = [
  {
    id: OrderStatus.MEASUREMENT_PENDING,
    title: "Measurements Pending",
    description: "Awaiting client fitting/measurements",
    color: "indigo",
  },
  {
    id: OrderStatus.CUTTING,
    title: "Master Cutting",
    description: "Fabric pattern marking & cutting",
    color: "amber",
  },
  {
    id: OrderStatus.STITCHING,
    title: "Tailoring & Stitching",
    description: "Machine & hand assembly",
    color: "orange",
  },
  {
    id: OrderStatus.FINISHING,
    title: "Finishing & Aari Work",
    description: "Embroidery, lining, hooks, pressing",
    color: "purple",
  },
  {
    id: OrderStatus.QUALITY_CHECK,
    title: "QC Inspection",
    description: "Dimension checking & finishing check",
    color: "cyan",
  },
  {
    id: OrderStatus.READY,
    title: "Ready for Trial / Pickup",
    description: "Client notified for fitting",
    color: "emerald",
  },
];

export async function getKanbanBoardData(branchId?: string) {
  const where: any = {
    status: {
      in: [
        OrderStatus.CONFIRMED,
        OrderStatus.MEASUREMENT_PENDING,
        OrderStatus.CUTTING,
        OrderStatus.STITCHING,
        OrderStatus.FINISHING,
        OrderStatus.QUALITY_CHECK,
        OrderStatus.ALTERATION,
        OrderStatus.READY,
      ],
    },
    ...(branchId ? { branchId } : {}),
  };

  const [orders, tailors] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: [{ priority: "desc" }, { expectedDeliveryDate: "asc" }, { createdAt: "asc" }],
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            whatsappNumber: true,
          },
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            customizations: true,
          },
        },
        assignedTailor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: [UserRole.TAILOR, UserRole.ADMIN, UserRole.OWNER, UserRole.STAFF] },
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Group into columns
  const columns: KanbanColumn[] = WORKSHOP_STAGES.map((stage) => {
    let stageOrders = orders.filter((o) => o.status === stage.id);
    // Include CONFIRMED into MEASUREMENT_PENDING if no measurement taken
    if (stage.id === OrderStatus.MEASUREMENT_PENDING) {
      const confirmedOrders = orders.filter((o) => o.status === OrderStatus.CONFIRMED);
      stageOrders = [...confirmedOrders, ...stageOrders];
    }
    // Include ALTERATION into STITCHING
    if (stage.id === OrderStatus.STITCHING) {
      const altOrders = orders.filter((o) => o.status === OrderStatus.ALTERATION);
      stageOrders = [...stageOrders, ...altOrders];
    }

    return {
      ...stage,
      orders: stageOrders as unknown as KanbanOrder[],
    };
  });

  return {
    columns,
    tailors,
    totalActive: orders.length,
  };
}

export async function moveOrderKanbanStage(
  orderId: string,
  newStatus: OrderStatus,
  actorId: string
) {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: { customer: true, assignedTailor: true },
  });

  await logAudit({
    userId: actorId,
    action: "status_change",
    entityType: "order",
    entityId: orderId,
    newValue: { status: newStatus },
  });

  return updatedOrder;
}

export async function assignTailorToOrder(
  orderId: string,
  tailorId: string | null,
  actorId: string
) {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { assignedTailorId: tailorId },
    include: { assignedTailor: true, customer: true },
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "order",
    entityId: orderId,
    newValue: { assignedTailorId: tailorId },
  });

  return updatedOrder;
}

export async function getTailorCapacityOverview(branchId?: string) {
  const tailors = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: [UserRole.TAILOR, UserRole.ADMIN, UserRole.OWNER, UserRole.STAFF] },
      ...(branchId ? { branchId } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      assignedOrders: {
        where: {
          status: {
            notIn: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
          },
        },
        include: {
          customer: { select: { fullName: true } },
          items: { select: { description: true, quantity: true } },
        },
        orderBy: [{ priority: "desc" }, { expectedDeliveryDate: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate workload stats per tailor
  const tailorWorkloads = tailors.map((tailor) => {
    const activeOrders = tailor.assignedOrders;
    const cuttingCount = activeOrders.filter((o) => o.status === OrderStatus.CUTTING).length;
    const stitchingCount = activeOrders.filter(
      (o) => o.status === OrderStatus.STITCHING || o.status === OrderStatus.ALTERATION
    ).length;
    const finishingCount = activeOrders.filter((o) => o.status === OrderStatus.FINISHING).length;
    const qcCount = activeOrders.filter((o) => o.status === OrderStatus.QUALITY_CHECK).length;
    const urgentCount = activeOrders.filter((o) => o.priority === Priority.URGENT).length;

    const totalGarments = activeOrders.reduce(
      (acc, order) => acc + order.items.reduce((sum, i) => sum + i.quantity, 0),
      0
    );

    // Standard workload threshold is 8 active garments per tailor
    const maxCapacity = 8;
    const utilizationPercent = Math.min(100, Math.round((totalGarments / maxCapacity) * 100));

    return {
      tailor: {
        id: tailor.id,
        name: tailor.name,
        email: tailor.email,
        phone: tailor.phone,
        role: tailor.role,
      },
      activeOrdersCount: activeOrders.length,
      totalGarments,
      cuttingCount,
      stitchingCount,
      finishingCount,
      qcCount,
      urgentCount,
      utilizationPercent,
      activeOrders,
    };
  });

  return tailorWorkloads;
}

export async function getTailorAssignedTasks(tailorUserId: string) {
  const orders = await prisma.order.findMany({
    where: {
      assignedTailorId: tailorUserId,
      status: {
        notIn: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      },
    },
    orderBy: [{ priority: "desc" }, { expectedDeliveryDate: "asc" }],
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          whatsappNumber: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
      measurementProfile: {
        include: {
          template: true,
          values: true,
        },
      },
    },
  });

  return orders;
}
