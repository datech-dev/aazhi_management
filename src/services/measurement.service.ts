import { prisma } from "@/lib/prisma";
import { Prisma, MeasurementUnit } from "@prisma/client";
import {
  MeasurementTemplateCreateInput,
  MeasurementTemplateUpdateInput,
  MeasurementProfileCreateInput,
  MeasurementProfileUpdateInput,
  MeasurementSearchInput,
} from "@/lib/validations/measurement";
import { logAudit } from "./audit.service";

/**
 * Measurement Templates & Tailor Profiling Service for Aazhi Designer Studio
 */

export async function getMeasurementTemplates() {
  return prisma.measurementTemplate.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      fields: {
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: { profiles: true },
      },
    },
  });
}

export async function getMeasurementTemplateById(id: string) {
  return prisma.measurementTemplate.findUnique({
    where: { id },
    include: {
      fields: {
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: { profiles: true },
      },
    },
  });
}

export async function createMeasurementTemplate(
  data: MeasurementTemplateCreateInput,
  actorId: string
) {
  const { fields, ...rest } = data;

  const template = await prisma.measurementTemplate.create({
    data: {
      ...rest,
      fields: {
        create: fields.map((f, idx) => ({
          name: f.name,
          key: f.key.toLowerCase().trim().replace(/\s+/g, "_"),
          unit: f.unit as MeasurementUnit,
          isRequired: f.isRequired,
          description: f.description || null,
          sortOrder: f.sortOrder ?? idx + 1,
        })),
      },
    },
    include: {
      fields: true,
    },
  });

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "measurement",
    entityId: template.id,
    newValue: { name: template.name, fieldsCount: fields.length },
  });

  return template;
}

export async function updateMeasurementTemplate(
  id: string,
  data: MeasurementTemplateUpdateInput,
  actorId: string
) {
  const { fields, ...rest } = data;

  const template = await prisma.$transaction(async (tx) => {
    // 1. Update basic template
    const updated = await tx.measurementTemplate.update({
      where: { id },
      data: {
        ...rest,
      },
    });

    // 2. Synchronize fields if supplied
    if (fields !== undefined) {
      await tx.measurementField.deleteMany({
        where: { templateId: id },
      });

      if (fields.length > 0) {
        await tx.measurementField.createMany({
          data: fields.map((f, idx) => ({
            templateId: id,
            name: f.name,
            key: f.key.toLowerCase().trim().replace(/\s+/g, "_"),
            unit: f.unit as MeasurementUnit,
            isRequired: f.isRequired,
            description: f.description || null,
            sortOrder: f.sortOrder ?? idx + 1,
          })),
        });
      }
    }

    return updated;
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "measurement",
    entityId: id,
    newValue: { updatedFields: Object.keys(data) },
  });

  return template;
}

export async function getMeasurementProfiles(query: MeasurementSearchInput) {
  const {
    search,
    templateId,
    customerId,
    page = 1,
    pageSize = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const where: Prisma.MeasurementProfileWhereInput = {
    ...(templateId ? { templateId } : {}),
    ...(customerId ? { customerId } : {}),
  };

  if (search && search.trim() !== "") {
    const term = search.trim();
    where.OR = [
      { customer: { fullName: { contains: term, mode: "insensitive" } } },
      { customer: { phone: { contains: term } } },
      { customer: { whatsappNumber: { contains: term } } },
      { notes: { contains: term, mode: "insensitive" } },
      { template: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [profiles, totalCount] = await Promise.all([
    prisma.measurementProfile.findMany({
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
        template: {
          include: {
            fields: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, role: true },
        },
        order: {
          select: { id: true, orderNumber: true, status: true },
        },
        values: true,
      },
    }),
    prisma.measurementProfile.count({ where }),
  ]);

  return {
    profiles,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export async function getMeasurementProfileById(id: string) {
  return prisma.measurementProfile.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          addresses: { where: { isDefault: true } },
        },
      },
      template: {
        include: {
          fields: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      createdBy: {
        select: { id: true, name: true, role: true },
      },
      order: {
        select: { id: true, orderNumber: true, status: true, expectedDeliveryDate: true },
      },
      values: true,
    },
  });
}

export async function createMeasurementProfile(
  data: MeasurementProfileCreateInput,
  actorId: string
) {
  const { customerId, templateId, unit, notes, orderId, values } = data;

  // Calculate version number: check existing profiles for this customer & template
  const existingCount = await prisma.measurementProfile.count({
    where: { customerId, templateId },
  });
  const version = existingCount + 1;

  const profile = await prisma.measurementProfile.create({
    data: {
      customerId,
      templateId,
      unit: unit as MeasurementUnit,
      version,
      notes: notes || null,
      orderId: orderId || null,
      createdById: actorId,
      values: {
        create: values.map((v) => ({
          fieldKey: v.fieldKey,
          value: new Prisma.Decimal(v.value),
        })),
      },
    },
    include: {
      customer: true,
      template: true,
      values: true,
    },
  });

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "measurement",
    entityId: profile.id,
    newValue: {
      customerId,
      templateName: profile.template.name,
      version,
      valuesCount: values.length,
    },
  });

  return profile;
}

export async function updateMeasurementProfile(
  id: string,
  data: MeasurementProfileUpdateInput,
  actorId: string
) {
  const { unit, notes, values, ...rest } = data;

  const profile = await prisma.$transaction(async (tx) => {
    // 1. Update profile basic fields
    const updated = await tx.measurementProfile.update({
      where: { id },
      data: {
        ...rest,
        ...(unit !== undefined ? { unit: unit as MeasurementUnit } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    // 2. Synchronize values if provided
    if (values !== undefined) {
      await tx.measurementValue.deleteMany({
        where: { profileId: id },
      });

      if (values.length > 0) {
        await tx.measurementValue.createMany({
          data: values.map((v) => ({
            profileId: id,
            fieldKey: v.fieldKey,
            value: new Prisma.Decimal(v.value),
          })),
        });
      }
    }

    return updated;
  });

  await logAudit({
    userId: actorId,
    action: "update",
    entityType: "measurement",
    entityId: id,
    newValue: { updatedFields: Object.keys(data) },
  });

  return profile;
}

export async function deleteMeasurementProfile(id: string, actorId: string) {
  const profile = await prisma.measurementProfile.delete({
    where: { id },
    include: { customer: true, template: true },
  });

  await logAudit({
    userId: actorId,
    action: "delete",
    entityType: "measurement",
    entityId: id,
    newValue: { customerName: profile.customer.fullName, template: profile.template.name },
  });

  return profile;
}

export async function getMeasurementStats() {
  const [
    totalProfiles,
    activeTemplates,
    blouseProfiles,
    kurtiProfiles,
    recentProfilesCount,
  ] = await Promise.all([
    prisma.measurementProfile.count(),
    prisma.measurementTemplate.count({ where: { isActive: true } }),
    prisma.measurementProfile.count({
      where: {
        template: { name: { contains: "Blouse", mode: "insensitive" } },
      },
    }),
    prisma.measurementProfile.count({
      where: {
        template: { name: { contains: "Kurti", mode: "insensitive" } },
      },
    }),
    prisma.measurementProfile.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ]);

  return {
    totalProfiles,
    activeTemplates,
    blouseProfiles,
    kurtiProfiles,
    recentProfilesCount,
  };
}
