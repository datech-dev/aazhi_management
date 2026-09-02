import { prisma } from "@/lib/prisma";
import { Prisma, LeadStatus, Priority, CustomerSource } from "@prisma/client";
import { logAudit } from "./audit.service";

/**
 * Inquiry & Lead Management Service
 */

export interface LeadFilterInput {
  status?: LeadStatus;
  priority?: Priority;
  assignedStaffId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface LeadCreateInput {
  customerId: string;
  source?: CustomerSource;
  enquiryMessage?: string;
  interestedProductId?: string;
  estimatedValue?: number;
  assignedStaffId?: string;
  priority?: Priority;
  followUpDate?: Date | string;
  notes?: string;
}

export async function generateLeadNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const count = await prisma.lead.count();
  const nextNum = (count + 1).toString().padStart(4, "0");
  return `LD-${currentYear}-${nextNum}`;
}

export async function createLead(data: LeadCreateInput, actorId: string) {
  const {
    customerId,
    source = CustomerSource.WHATSAPP,
    enquiryMessage,
    interestedProductId,
    estimatedValue,
    assignedStaffId,
    priority = Priority.MEDIUM,
    followUpDate,
    notes,
  } = data;

  const leadNumber = await generateLeadNumber();

  const lead = await prisma.lead.create({
    data: {
      leadNumber,
      customerId,
      source,
      enquiryMessage,
      interestedProductId,
      estimatedValue: estimatedValue ? new Prisma.Decimal(estimatedValue) : null,
      assignedStaffId: assignedStaffId || actorId,
      priority,
      status: LeadStatus.NEW,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      notes,
    },
    include: {
      customer: true,
      assignedStaff: { select: { id: true, name: true } },
    },
  });

  // Write Lead Activity
  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      userId: actorId,
      action: "created",
      details: "Inquiry lead created",
      newValue: LeadStatus.NEW,
    },
  });

  await logAudit({
    userId: actorId,
    action: "create",
    entityType: "lead",
    entityId: lead.id,
    newValue: { leadNumber, customerId },
  });

  return lead;
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  notes?: string,
  actorId?: string
) {
  const currentLead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!currentLead) {
    throw new Error("Lead not found");
  }

  const isConverted = status === LeadStatus.CONVERTED;
  const convertedAt = isConverted ? new Date() : currentLead.convertedAt;

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status,
      convertedAt,
      ...(notes ? { notes } : {}),
    },
  });

  // Track Lead Activity Timeline
  await prisma.leadActivity.create({
    data: {
      leadId,
      userId: actorId || null,
      action: "status_changed",
      details: notes || `Lead status changed to ${status}`,
      oldValue: currentLead.status,
      newValue: status,
    },
  });

  if (actorId) {
    await logAudit({
      userId: actorId,
      action: "status_change",
      entityType: "lead",
      entityId: leadId,
      oldValue: { status: currentLead.status },
      newValue: { status },
    });
  }

  return updatedLead;
}

export async function getLeadsList(input: LeadFilterInput = {}) {
  const { status, priority, assignedStaffId, search, page = 1, pageSize = 30 } = input;

  const where: Prisma.LeadWhereInput = {
    isArchived: false,
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(assignedStaffId ? { assignedStaffId } : {}),
    ...(search
      ? {
          OR: [
            { leadNumber: { contains: search, mode: "insensitive" } },
            { enquiryMessage: { contains: search, mode: "insensitive" } },
            { customer: { fullName: { contains: search, mode: "insensitive" } } },
            { customer: { phone: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
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
        assignedStaff: {
          select: {
            id: true,
            name: true,
          },
        },
        interestedProduct: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    }),
    prisma.lead.count({ where }),
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
