import { prisma } from "@/lib/prisma";
import { Prisma, PaymentMethod, PaymentType, PaymentStatus } from "@prisma/client";
import { PaymentCreateInput, PaymentSearchInput } from "@/lib/validations/payment";
import { logAudit } from "./audit.service";

/**
 * Decimal-Safe Payment & Financial Service
 */

export async function generatePaymentNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.payment.count();
  const nextNum = (count + 1).toString().padStart(4, "0");
  return `PAY-${currentYear}-${nextNum}`;
}

export async function recordPayment(data: PaymentCreateInput, actorId: string) {
  const { orderId, customerId, amount, method, type, referenceNumber, notes } = data;
  const paymentAmount = new Prisma.Decimal(amount);

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current order
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const paymentNumber = await generatePaymentNumber();

    // 2. Create Payment record
    const payment = await tx.payment.create({
      data: {
        paymentNumber,
        orderId,
        customerId: customerId || order.customerId,
        amount: paymentAmount,
        method,
        type,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        recordedById: actorId,
      },
    });

    // 3. Recalculate order payment totals
    const existingPayments = await tx.payment.findMany({
      where: {
        orderId,
        isVoided: false,
      },
    });

    const totalPaidNum = existingPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const orderTotalNum = Number(order.total);
    const newAdvancePaid = new Prisma.Decimal(totalPaidNum);
    const newBalanceNum = Math.max(0, orderTotalNum - totalPaidNum);
    const newBalance = new Prisma.Decimal(newBalanceNum);

    let newPaymentStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (totalPaidNum >= orderTotalNum && orderTotalNum > 0) {
      newPaymentStatus = PaymentStatus.FULLY_PAID;
    } else if (totalPaidNum > 0) {
      if (type === "ADVANCE" && totalPaidNum < orderTotalNum) {
        newPaymentStatus = PaymentStatus.ADVANCE_PAID;
      } else {
        newPaymentStatus = PaymentStatus.PARTIALLY_PAID;
      }
    }

    // 4. Update order payment status & balance
    await tx.order.update({
      where: { id: orderId },
      data: {
        advancePaid: newAdvancePaid,
        balance: newBalance,
        paymentStatus: newPaymentStatus,
      },
    });

    // 5. Update customer lifetime value
    const targetCustomerId = customerId || order.customerId;
    const allCustomerPayments = await tx.payment.findMany({
      where: {
        customerId: targetCustomerId,
        isVoided: false,
      },
    });

    const totalLifetimeValueNum = allCustomerPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    await tx.customer.update({
      where: { id: targetCustomerId },
      data: {
        totalLifetimeValue: new Prisma.Decimal(totalLifetimeValueNum),
        lastInteractionAt: new Date(),
      },
    });

    // 6. Audit Log
    await logAudit({
      userId: actorId,
      action: "payment_recorded",
      entityType: "payment",
      entityId: payment.id,
      newValue: {
        paymentNumber,
        amount: Number(paymentAmount),
        method,
        orderNumber: order.orderNumber,
      },
    });

    return payment;
  });
}

export async function voidPayment(paymentId: string, reason: string, actorId: string) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.isVoided) {
      throw new Error("Payment is already voided");
    }

    // 1. Mark as voided
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        isVoided: true,
        voidedAt: new Date(),
        voidedReason: reason,
      },
    });

    // 2. Recalculate order balance
    const activePayments = await tx.payment.findMany({
      where: {
        orderId: payment.orderId,
        isVoided: false,
      },
    });

    const totalPaidNum = activePayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const orderTotalNum = Number(payment.order.total);
    const newBalanceNum = Math.max(0, orderTotalNum - totalPaidNum);

    let newPaymentStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (totalPaidNum >= orderTotalNum && orderTotalNum > 0) {
      newPaymentStatus = PaymentStatus.FULLY_PAID;
    } else if (totalPaidNum > 0) {
      newPaymentStatus = PaymentStatus.PARTIALLY_PAID;
    }

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        advancePaid: new Prisma.Decimal(totalPaidNum),
        balance: new Prisma.Decimal(newBalanceNum),
        paymentStatus: newPaymentStatus,
      },
    });

    // 3. Recalculate Customer lifetime value
    const customerPayments = await tx.payment.findMany({
      where: {
        customerId: payment.customerId,
        isVoided: false,
      },
    });

    const totalLtvNum = customerPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    await tx.customer.update({
      where: { id: payment.customerId },
      data: {
        totalLifetimeValue: new Prisma.Decimal(totalLtvNum),
      },
    });

    // 4. Audit Log
    await logAudit({
      userId: actorId,
      action: "payment_voided",
      entityType: "payment",
      entityId: payment.id,
      newValue: { voidedReason: reason, amount: Number(payment.amount) },
    });

    return updatedPayment;
  });
}

export async function processRefund(
  paymentId: string,
  refundAmount: number,
  reason: string,
  actorId: string
) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    if (payment.isVoided) {
      throw new Error("Cannot process refund on voided payment");
    }

    const refund = await tx.paymentRefund.create({
      data: {
        paymentId,
        amount: new Prisma.Decimal(refundAmount),
        reason: reason || "Customer Refund",
        processedBy: actorId,
      },
    });

    await logAudit({
      userId: actorId,
      action: "payment_refunded",
      entityType: "payment_refund",
      entityId: refund.id,
      newValue: { refundAmount, paymentId, reason },
    });

    return refund;
  });
}

export async function getPaymentsList(input: Partial<PaymentSearchInput> = {}) {
  const {
    search,
    orderId,
    customerId,
    method,
    type,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = input;

  const where: Prisma.PaymentWhereInput = {
    isVoided: false,
    ...(orderId ? { orderId } : {}),
    ...(customerId ? { customerId } : {}),
    ...(method ? { method: method as PaymentMethod } : {}),
    ...(type ? { type: type as PaymentType } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { paymentNumber: { contains: search, mode: "insensitive" } },
            { referenceNumber: { contains: search, mode: "insensitive" } },
            { order: { orderNumber: { contains: search, mode: "insensitive" } } },
            { customer: { fullName: { contains: search, mode: "insensitive" } } },
            { customer: { phone: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            balance: true,
            status: true,
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
        recordedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
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

export async function getPaymentDetails(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: true,
          customer: true,
          salesperson: { select: { id: true, name: true } },
        },
      },
      customer: {
        include: {
          addresses: true,
        },
      },
      recordedBy: {
        select: { id: true, name: true, email: true },
      },
      refunds: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
}

export async function getFinancialSummary(branchId?: string) {
  const whereClause: Prisma.PaymentWhereInput = {
    isVoided: false,
    ...(branchId ? { order: { branchId } } : {}),
  };

  const payments = await prisma.payment.findMany({
    where: whereClause,
    select: {
      amount: true,
      method: true,
      type: true,
    },
  });

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalAdvance = payments
    .filter((p) => p.type === "ADVANCE")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const byMethod = {
    CASH: payments.filter((p) => p.method === "CASH").reduce((sum, p) => sum + Number(p.amount), 0),
    UPI: payments.filter((p) => p.method === "UPI").reduce((sum, p) => sum + Number(p.amount), 0),
    BANK_TRANSFER: payments.filter((p) => p.method === "BANK_TRANSFER").reduce((sum, p) => sum + Number(p.amount), 0),
    CARD: payments.filter((p) => p.method === "CARD").reduce((sum, p) => sum + Number(p.amount), 0),
    OTHER: payments.filter((p) => p.method === "OTHER").reduce((sum, p) => sum + Number(p.amount), 0),
  };

  // Outstanding balances across open orders
  const openOrders = await prisma.order.findMany({
    where: {
      isArchived: false,
      status: { notIn: ["CANCELLED", "COMPLETED"] },
      ...(branchId ? { branchId } : {}),
    },
    select: {
      balance: true,
    },
  });

  const totalOutstanding = openOrders.reduce(
    (sum, o) => sum + Number(o.balance),
    0
  );

  return {
    totalCollected,
    totalAdvance,
    totalOutstanding,
    transactionCount: payments.length,
    byMethod,
  };
}
