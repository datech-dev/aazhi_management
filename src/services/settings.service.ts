import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { logAudit } from "./audit.service";

/**
 * Business Settings & Audit Log Service
 */

export interface AuditLogFilterInput {
  entityType?: string;
  userId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getBusinessSettings() {
  const settingsList = await prisma.businessSettings.findMany({
    orderBy: { key: "asc" },
  });

  const settingsMap: Record<string, string> = {
    studio_name: "Aazhi Designer Studio",
    studio_tagline: "Boutique Fashion & Custom Tailoring",
    phone: "+91 98765 43210",
    email: "contact@aazhi.studio",
    gstin: "33AAAAA0000A1Z5",
    currency_symbol: "₹",
    tax_percent_default: "5",
    order_prefix: "AZ",
    quote_prefix: "QT",
    payment_prefix: "PAY",
    lead_prefix: "LD",
  };

  settingsList.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return settingsMap;
}

export async function updateBusinessSettings(
  settings: Record<string, string>,
  actorId: string
) {
  return await prisma.$transaction(async (tx) => {
    for (const [key, value] of Object.entries(settings)) {
      await tx.businessSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await logAudit({
      userId: actorId,
      action: "update",
      entityType: "settings",
      entityId: "business_settings",
      newValue: settings,
    });

    return true;
  });
}

export async function getAuditLogs(input: AuditLogFilterInput = {}) {
  const { entityType, userId, search, page = 1, pageSize = 30 } = input;

  const where: Prisma.AuditLogWhereInput = {
    ...(entityType ? { entityType } : {}),
    ...(userId ? { userId } : {}),
    ...(search
      ? {
          OR: [
            { action: { contains: search, mode: "insensitive" } },
            { entityType: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
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
