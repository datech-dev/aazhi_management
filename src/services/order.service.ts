import { prisma } from "@/lib/prisma";
import {
  Prisma,
  OrderStatus,
  Priority,
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  QuotationStatus,
} from "@prisma/client";
import {
  OrderCreateInput,
  OrderStatusUpdateInput,
  OrderPaymentRecordInput,
  QuotationCreateInput,
  OrderSearchInput,
} from "@/lib/validations/order";
import { logAudit } from "./audit.service";

/**
 * Orders & Quotations Engine for Aazhi Designer Studio
 */

export async function generateOrderNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.order.count();
  const nextNum = (count + 1).toString().padStart(4, "0");
  return `AZ-${currentYear}-${nextNum}`;
}

export async function generateQuotationNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.quotation.count();
  const nextNum = (count + 1).toString().padStart(4, "0");
  return `QT-${currentYear}-${nextNum}`;
}

export async function generatePaymentNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.payment.count();
  const nextNum = (count + 1).toString().padStart(4, "0");
  return `PAY-${currentYear}-${nextNum}`;
}

export async function createOrder(data: OrderCreateInput, actorId: string) {
  const {
    customerId,
    branchId,
    salespersonId,
    priority = "MEDIUM",
    expectedDeliveryDate,
    notes,
    taxPercent = 5,
    discountAmount = 0,
    items,
    advancePayment,
  } = data;

  // 1. Calculate line totals
  let rawSubtotal = 0;
  const processedItems = items.map((item) => {
    const itemSubtotal = item.unitPrice * item.quantity;
    rawSubtotal += itemSubtotal;

    return {
      description: item.name,
      productId: item.productId || null,
      customizations: item.customizations || null,
      notes: item.notes || null,
      unitPrice: new Prisma.Decimal(item.unitPrice),
      quantity: item.quantity,
      totalPrice: new Prisma.Decimal(itemSubtotal),
    };
  });

  const orderTaxable = Math.max(0, rawSubtotal - discountAmount);
  const totalTaxAmount = (orderTaxable * taxPercent) / 100;
  const orderTotalAmount = orderTaxable + totalTaxAmount;

  const initialPaidAmount = advancePayment?.amount ? Number(advancePayment.amount) : 0;
  let paymentStatus: PaymentStatus = PaymentStatus.UNPAID;
  if (initialPaidAmount >= orderTotalAmount && orderTotalAmount > 0) {
    paymentStatus = PaymentStatus.FULLY_PAID;
  } else if (initialPaidAmount > 0) {
    paymentStatus = PaymentStatus.PARTIALLY_PAID;
  }

  const balance = Math.max(0, orderTotalAmount - initialPaidAmount);
  const orderNumber = await generateOrderNumber();

  // 2. Atomic Database Transaction
  const order = await prisma.$transaction(async (tx) => {
    let effectiveBranchId = branchId;
    if (!effectiveBranchId) {
      const defaultBranch = await tx.branch.findFirst();
      effectiveBranchId = defaultBranch?.id || null;
    }

    // A. Create Order
    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        branchId: effectiveBranchId,
        salespersonId: salespersonId || actorId,
        status: OrderStatus.CONFIRMED,
        priority: priority as Priority,
        expectedDeliveryDate: expectedDeliveryDate || null,
        notes: notes || null,
        subtotal: new Prisma.Decimal(rawSubtotal),
        discountAmount: new Prisma.Decimal(discountAmount),
        taxPercent: new Prisma.Decimal(taxPercent),
        taxAmount: new Prisma.Decimal(totalTaxAmount),
        total: new Prisma.Decimal(orderTotalAmount),
        advancePaid: new Prisma.Decimal(initialPaidAmount),
        balance: new Prisma.Decimal(balance),
        paymentStatus,
        items: {
          create: processedItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // B. Record initial advance payment if provided
    if (initialPaidAmount > 0 && advancePayment) {
      const paymentNumber = await generatePaymentNumber();
      await tx.payment.create({
        data: {
          paymentNumber,
          orderId: createdOrder.id,
          customerId,
          amount: new Prisma.Decimal(initialPaidAmount),
          method: advancePayment.method as PaymentMethod,
          type: PaymentType.ADVANCE,
          referenceNumber: advancePayment.referenceNumber || null,
          notes: advancePayment.notes || "Advance payment received at booking",
          recordedById: actorId,
        },
      });
    }

    // C. Update Customer Lifetime Metrics
    await tx.customer.update({
      where: { id: customerId },
      data: {
        totalOrders: { increment: 1 },
        totalLifetimeValue: { increment: orderTotalAmount },
      },
    });

    return createdOrder;
  });

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "order",
    entityId: order.id,
    newValue: {
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      total: orderTotalAmount,
      itemsCount: items.length,
    },
  });

  return order;
}

export async function getOrders(query: OrderSearchInput) {
  const {
    search,
    status,
    priority,
    paymentStatus,
    customerId,
    page = 1,
    pageSize = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const where: Prisma.OrderWhereInput = {
    ...(status && status !== "ALL" ? { status: status as OrderStatus } : {}),
    ...(priority && priority !== "ALL" ? { priority: priority as Priority } : {}),
    ...(paymentStatus && paymentStatus !== "ALL"
      ? { paymentStatus: paymentStatus as PaymentStatus }
      : {}),
    ...(customerId ? { customerId } : {}),
  };

  if (search && search.trim() !== "") {
    const term = search.trim();
    where.OR = [
      { orderNumber: { contains: term, mode: "insensitive" } },
      { customer: { fullName: { contains: term, mode: "insensitive" } } },
      { customer: { phone: { contains: term } } },
      { customer: { whatsappNumber: { contains: term } } },
      { notes: { contains: term, mode: "insensitive" } },
      { items: { some: { description: { contains: term, mode: "insensitive" } } } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            whatsappNumber: true,
            instagramUsername: true,
          },
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            totalPrice: true,
          },
        },
        salesperson: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          addresses: { where: { isDefault: true } },
          tags: { include: { tag: true } },
        },
      },
      branch: true,
      salesperson: {
        select: { id: true, name: true, role: true },
      },
      assignedTailor: {
        select: { id: true, name: true, role: true },
      },
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        include: {
          recordedBy: {
            select: { id: true, name: true },
          },
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
}

export async function updateOrderStatus(
  id: string,
  newStatus: OrderStatus,
  notes: string | null | undefined,
  actorId: string
) {
  const order = await prisma.order.update({
    where: { id },
    data: {
      status: newStatus,
      ...(notes ? { notes } : {}),
    },
    include: { customer: true },
  });

  await logAudit({
    userId: actorId,
    action: "status_change",
    entityType: "order",
    entityId: id,
    newValue: { status: newStatus, notes },
  });

  return order;
}

export async function recordOrderPayment(data: OrderPaymentRecordInput, actorId: string) {
  const { orderId, amount, method, type, referenceNumber, notes } = data;

  const paymentNumber = await generatePaymentNumber();

  const payment = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: { customerId: true, total: true, advancePaid: true },
    });

    const newAdvanceTotal = Number(order.advancePaid) + Number(amount);
    const orderTotal = Number(order.total);
    const newBalance = Math.max(0, orderTotal - newAdvanceTotal);

    let paymentStatus: PaymentStatus = PaymentStatus.PARTIALLY_PAID;
    if (newAdvanceTotal >= orderTotal) {
      paymentStatus = PaymentStatus.FULLY_PAID;
    }

    // 1. Create payment record
    const createdPayment = await tx.payment.create({
      data: {
        paymentNumber,
        orderId,
        customerId: order.customerId,
        amount: new Prisma.Decimal(amount),
        method: method as PaymentMethod,
        type: type as PaymentType,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        recordedById: actorId,
      },
    });

    // 2. Update order advance, balance, and status
    await tx.order.update({
      where: { id: orderId },
      data: {
        advancePaid: new Prisma.Decimal(newAdvanceTotal),
        balance: new Prisma.Decimal(newBalance),
        paymentStatus,
      },
    });

    return createdPayment;
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "payment",
    entityId: payment.id,
    newValue: { orderId, amount, method },
  });

  return payment;
}

export async function getOrderStats() {
  const [
    activeOrders,
    inProduction,
    readyForTrial,
    urgentOrders,
    monthlyDelivered,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        status: {
          notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.COMPLETED],
        },
      },
    }),
    prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.CUTTING, OrderStatus.STITCHING, OrderStatus.FINISHING],
        },
      },
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.READY,
      },
    }),
    prisma.order.count({
      where: {
        priority: Priority.URGENT,
        status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.COMPLETED] },
      },
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.DELIVERED,
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    activeOrders,
    inProduction,
    readyForTrial,
    urgentOrders,
    monthlyDelivered,
  };
}

// Quotations Service

export async function getQuotations() {
  return prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          whatsappNumber: true,
        },
      },
      items: true,
    },
  });
}

export async function createQuotation(data: QuotationCreateInput, actorId: string) {
  const { customerId, validUntil, notes, taxPercent = 5, discountAmount = 0, items } = data;

  let rawSubtotal = 0;
  const processedItems = items.map((item) => {
    const itemSubtotal = item.unitPrice * item.quantity;
    rawSubtotal += itemSubtotal;

    return {
      description: item.description,
      productId: item.productId || null,
      notes: item.notes || null,
      unitPrice: new Prisma.Decimal(item.unitPrice),
      quantity: item.quantity,
      totalPrice: new Prisma.Decimal(itemSubtotal),
    };
  });

  const quoteTaxable = Math.max(0, rawSubtotal - discountAmount);
  const totalTaxAmount = (quoteTaxable * taxPercent) / 100;
  const quoteTotalAmount = quoteTaxable + totalTaxAmount;

  const quoteNumber = await generateQuotationNumber();

  const quotation = await prisma.quotation.create({
    data: {
      quoteNumber,
      customerId,
      status: QuotationStatus.DRAFT,
      validUntil: validUntil || null,
      notes: notes || null,
      subtotal: new Prisma.Decimal(rawSubtotal),
      discountAmount: new Prisma.Decimal(discountAmount),
      taxPercent: new Prisma.Decimal(taxPercent),
      taxAmount: new Prisma.Decimal(totalTaxAmount),
      total: new Prisma.Decimal(quoteTotalAmount),
      items: {
        create: processedItems,
      },
    },
    include: {
      customer: true,
      items: true,
    },
  });

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "order",
    entityId: quotation.id,
    newValue: { quoteNumber, total: quoteTotalAmount },
  });

  return quotation;
}
