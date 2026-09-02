import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CustomerCreateInput, CustomerUpdateInput, CustomerSearchInput } from "@/lib/validations/customer";
import { logAudit } from "./audit.service";

/**
 * Customer CRM Service for Aazhi Designer Studio
 */

export async function getCustomers(query: Partial<CustomerSearchInput> = {}, branchId?: string | null) {
  const { search, source, tag, page = 1, pageSize = 20, sortBy = "createdAt", sortOrder = "desc" } = query;

  const where: Prisma.CustomerWhereInput = {
    isArchived: false,
    ...(branchId ? { branchId } : {}),
    ...(source ? { source } : {}),
  };

  // Tag filter
  if (tag) {
    where.tags = {
      some: {
        tag: {
          name: {
            equals: tag,
            mode: "insensitive",
          },
        },
      },
    };
  }

  // Search across Name, Phone, WhatsApp, Instagram, Email
  if (search && search.trim() !== "") {
    const term = search.trim();
    where.OR = [
      { fullName: { contains: term, mode: "insensitive" } },
      { preferredName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
      { whatsappNumber: { contains: term } },
      { instagramUsername: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
        _count: {
          select: {
            orders: { where: { isArchived: false } },
            measurementProfiles: true,
          },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      addresses: {
        orderBy: { isDefault: "desc" },
      },
      customerNotes: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      },
      measurementProfiles: {
        orderBy: { createdAt: "desc" },
        include: {
          template: {
            include: {
              fields: true,
            },
          },
          values: true,
        },
      },
      orders: {
        where: { isArchived: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: {
            take: 2,
            select: { id: true, description: true, unitPrice: true, totalPrice: true },
          },
        },
      },
      quotations: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      conversations: {
        where: { isArchived: false },
        orderBy: { updatedAt: "desc" },
        take: 3,
      },
    },
  });

  return customer;
}

export async function createCustomer(
  data: CustomerCreateInput,
  actorId: string,
  branchId?: string | null
) {
  const { addresses, tags, ...rest } = data;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the customer
    const customer = await tx.customer.create({
      data: {
        ...rest,
        branchId: branchId || undefined,
        addresses: addresses && addresses.length > 0 ? {
          create: addresses.map((addr) => ({
            label: addr.label,
            line1: addr.line1,
            line2: addr.line2 || null,
            city: addr.city,
            state: addr.state || null,
            pincode: addr.pincode || "",
            isDefault: addr.isDefault,
          })),
        } : undefined,
      },
    });

    // 2. Attach tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        if (!tagName.trim()) continue;
        const tag = await tx.tag.upsert({
          where: { name: tagName.trim() },
          update: {},
          create: {
            name: tagName.trim(),
            color: getTagColor(tagName.trim()),
          },
        });

        await tx.customerTag.create({
          data: {
            customerId: customer.id,
            tagId: tag.id,
          },
        });
      }
    }

    return customer;
  });

  // Audit log
  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "customer",
    entityId: result.id,
    newValue: { fullName: result.fullName, phone: result.phone, source: result.source },
  });

  return result;
}

export async function updateCustomer(
  id: string,
  data: CustomerUpdateInput,
  actorId: string
) {
  const { addresses, tags, ...rest } = data;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update basic fields
    const customer = await tx.customer.update({
      where: { id },
      data: {
        ...rest,
      },
    });

    // 2. Synchronize addresses if provided
    if (addresses !== undefined) {
      // Remove old addresses
      await tx.customerAddress.deleteMany({
        where: { customerId: id },
      });

      if (addresses.length > 0) {
        await tx.customerAddress.createMany({
          data: addresses.map((addr) => ({
            customerId: id,
            label: addr.label,
            line1: addr.line1,
            line2: addr.line2 || null,
            city: addr.city,
            state: addr.state || null,
            pincode: addr.pincode || "",
            isDefault: addr.isDefault,
          })),
        });
      }
    }

    // 3. Synchronize tags if provided
    if (tags !== undefined) {
      await tx.customerTag.deleteMany({
        where: { customerId: id },
      });

      for (const tagName of tags) {
        if (!tagName.trim()) continue;
        const tag = await tx.tag.upsert({
          where: { name: tagName.trim() },
          update: {},
          create: {
            name: tagName.trim(),
            color: getTagColor(tagName.trim()),
          },
        });

        await tx.customerTag.create({
          data: {
            customerId: id,
            tagId: tag.id,
          },
        });
      }
    }

    return customer;
  });

  // Audit log
  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "customer",
    entityId: id,
    newValue: { updatedFields: Object.keys(data) },
  });

  return result;
}

export async function deleteCustomer(id: string, actorId: string) {
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      isArchived: true,
      archivedAt: new Date(),
    },
  });

  await logAudit({
    userId: actorId,
    action: "delete",
    entityType: "customer",
    entityId: id,
    newValue: { fullName: customer.fullName },
  });

  return customer;
}

export async function addCustomerNote(
  customerId: string,
  content: string,
  actorId: string
) {
  const note = await prisma.customerNote.create({
    data: {
      customerId,
      userId: actorId,
      content: content.trim(),
    },
    include: {
      user: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "customer",
    entityId: note.id,
    newValue: { customerId, noteLength: content.length },
  });

  return note;
}

export async function getCustomerStats(branchId?: string | null) {
  const where: Prisma.CustomerWhereInput = {
    isArchived: false,
    ...(branchId ? { branchId } : {}),
  };

  const [totalClients, bridalClients, repeatClients, ltvAggregate] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.count({
      where: {
        ...where,
        tags: {
          some: {
            tag: {
              name: { in: ["Bridal", "Bride", "Wedding", "BRIDAL"], mode: "insensitive" },
            },
          },
        },
      },
    }),
    prisma.customer.count({
      where: {
        ...where,
        totalOrders: { gt: 1 },
      },
    }),
    prisma.customer.aggregate({
      where,
      _sum: {
        totalLifetimeValue: true,
      },
    }),
  ]);

  const totalRevenue = Number(ltvAggregate._sum.totalLifetimeValue || 0);
  const repeatRate = totalClients > 0 ? Math.round((repeatClients / totalClients) * 100) : 0;

  return {
    totalClients,
    bridalClients,
    repeatClients,
    repeatRate,
    totalRevenue,
  };
}

function getTagColor(tagName: string): string {
  const lower = tagName.toLowerCase();
  if (lower.includes("bridal") || lower.includes("wedding")) return "#9C27B0"; // purple
  if (lower.includes("vip") || lower.includes("premium")) return "#D4AF37"; // gold
  if (lower.includes("repeat") || lower.includes("loyal")) return "#2E7D32"; // green
  if (lower.includes("urgent") || lower.includes("express")) return "#D32F2F"; // red
  if (lower.includes("blouse")) return "#E91E63"; // pink
  return "#757575"; // neutral grey
}
