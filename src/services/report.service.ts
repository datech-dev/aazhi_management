import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus, QCResult } from "@prisma/client";

/**
 * Executive Analytics & Reports Service for Aazhi Designer Studio
 */

export interface ReportFilterInput {
  startDate?: Date;
  endDate?: Date;
  branchId?: string;
}

export async function getRevenueAnalytics(filters: ReportFilterInput = {}) {
  const { startDate, endDate, branchId } = filters;

  const paymentWhere: Prisma.PaymentWhereInput = {
    isVoided: false,
    ...(branchId ? { order: { branchId } } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const payments = await prisma.payment.findMany({
    where: paymentWhere,
    select: {
      amount: true,
      method: true,
      type: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const transactionCount = payments.length;
  const averageTransaction = transactionCount > 0 ? Math.round(totalCollected / transactionCount) : 0;

  // Group by day for chart time-series
  const dailyMap = new Map<string, number>();
  payments.forEach((p) => {
    const day = new Date(p.createdAt).toISOString().split("T")[0];
    const current = dailyMap.get(day) || 0;
    dailyMap.set(day, current + Number(p.amount));
  });

  const timeSeries = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // Orders summary
  const orderWhere: Prisma.OrderWhereInput = {
    isArchived: false,
    ...(branchId ? { branchId } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      total: true,
      balance: true,
      advancePaid: true,
      status: true,
    },
  });

  const totalOrderValue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOutstanding = orders
    .filter((o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.COMPLETED)
    .reduce((sum, o) => sum + Number(o.balance), 0);

  const averageOrderValue = orders.length > 0 ? Math.round(totalOrderValue / orders.length) : 0;

  return {
    totalCollected,
    totalOrderValue,
    totalOutstanding,
    averageOrderValue,
    transactionCount,
    averageTransaction,
    timeSeries,
  };
}

export async function getCategoryPerformance(filters: ReportFilterInput = {}) {
  const { startDate, endDate, branchId } = filters;

  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        isArchived: false,
        status: { not: OrderStatus.CANCELLED },
        ...(branchId ? { branchId } : {}),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
    },
    select: {
      description: true,
      quantity: true,
      totalPrice: true,
      product: {
        select: {
          category: {
            select: { name: true },
          },
        },
      },
    },
  });

  const categoryMap = new Map<string, { revenue: number; quantity: number }>();

  items.forEach((item) => {
    let categoryName = item.product?.category?.name;
    if (!categoryName) {
      const descLower = item.description.toLowerCase();
      if (descLower.includes("blouse")) categoryName = "Blouses";
      else if (descLower.includes("kurti") || descLower.includes("kurta")) categoryName = "Kurtis";
      else if (descLower.includes("saree")) categoryName = "Sarees";
      else if (descLower.includes("lehenga")) categoryName = "Lehengas";
      else if (descLower.includes("gown") || descLower.includes("dress")) categoryName = "Gowns & Dresses";
      else categoryName = "Custom Couture";
    }

    const current = categoryMap.get(categoryName) || { revenue: 0, quantity: 0 };
    categoryMap.set(categoryName, {
      revenue: current.revenue + Number(item.totalPrice),
      quantity: current.quantity + item.quantity,
    });
  });

  return Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    revenue: data.revenue,
    quantity: data.quantity,
  }));
}

export async function getTailorProductivity(filters: ReportFilterInput = {}) {
  const tailors = await prisma.user.findMany({
    where: {
      role: "TAILOR",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      productionJobs: {
        include: {
          order: {
            select: {
              items: true,
              expectedDeliveryDate: true,
            },
          },
          qualityChecks: true,
        },
      },
    },
  });

  return tailors.map((tailor) => {
    const jobs = tailor.productionJobs;
    const completedJobs = jobs.filter((j) => j.stage === "READY");
    const activeJobs = jobs.filter((j) => j.stage !== "READY");

    let totalGarments = 0;
    jobs.forEach((j) => {
      j.order.items.forEach((item) => {
        totalGarments += item.quantity;
      });
    });

    const totalQCs = jobs.flatMap((j) => j.qualityChecks);
    const passedQCs = totalQCs.filter((qc) => qc.result === QCResult.PASSED).length;
    const qcPassRate = totalQCs.length > 0 ? Math.round((passedQCs / totalQCs.length) * 100) : 100;

    return {
      id: tailor.id,
      name: tailor.name,
      completedCount: completedJobs.length,
      activeCount: activeJobs.length,
      totalGarments,
      qcPassRate,
    };
  });
}

export async function getCustomerLTVAnalytics() {
  const topCustomers = await prisma.customer.findMany({
    where: { isArchived: false },
    take: 10,
    orderBy: { totalLifetimeValue: "desc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      totalOrders: true,
      totalLifetimeValue: true,
      source: true,
    },
  });

  const totalCustomers = await prisma.customer.count({ where: { isArchived: false } });
  const repeatCustomers = await prisma.customer.count({
    where: { isArchived: false, totalOrders: { gt: 1 } },
  });

  const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  return {
    topCustomers,
    totalCustomers,
    repeatCustomers,
    repeatRate,
  };
}
