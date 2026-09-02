import { prisma } from "@/lib/prisma";
import { Prisma, ChannelType, ConversationStatus, MessageDirection, MessageStatus } from "@prisma/client";
import { getChannelAdapter } from "./messaging.service";
import { logAudit } from "./audit.service";

/**
 * Unified Messaging & Social Inbox Service
 */

export interface ConversationFilterInput {
  channel?: ChannelType;
  status?: ConversationStatus;
  search?: string;
  assignedStaffId?: string;
  page?: number;
  pageSize?: number;
}

export async function getConversationsList(input: ConversationFilterInput = {}) {
  const { channel, status, search, assignedStaffId, page = 1, pageSize = 30 } = input;

  const where: Prisma.ConversationWhereInput = {
    isArchived: false,
    ...(channel ? { channel } : {}),
    ...(status ? { status } : {}),
    ...(assignedStaffId ? { assignedStaffId } : {}),
    ...(search
      ? {
          OR: [
            { subject: { contains: search, mode: "insensitive" } },
            { lastMessagePreview: { contains: search, mode: "insensitive" } },
            { customer: { fullName: { contains: search, mode: "insensitive" } } },
            { customer: { phone: { contains: search, mode: "insensitive" } } },
            { customer: { instagramUsername: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { lastMessageAt: "desc" },
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
        _count: {
          select: { messages: true },
        },
      },
    }),
    prisma.conversation.count({ where }),
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

export async function getConversationDetails(id: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          measurementProfiles: {
            take: 3,
            include: { template: true },
          },
          orders: {
            take: 3,
            orderBy: { createdAt: "desc" },
          },
        },
      },
      assignedStaff: {
        select: { id: true, name: true, email: true },
      },
      relatedLead: true,
      relatedOrder: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          attachments: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("Conversation thread not found");
  }

  return conversation;
}

export async function sendMessage(
  conversationId: string,
  content: string,
  mediaUrl?: string,
  actorId?: string
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { customer: true },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Determine recipient phone or handle
  const recipient =
    conversation.customer?.whatsappNumber ||
    conversation.customer?.phone ||
    conversation.customer?.instagramUsername ||
    "customer";

  // 1. Create DB Message record
  const message = await prisma.message.create({
    data: {
      conversationId,
      direction: MessageDirection.OUTBOUND,
      content,
      status: MessageStatus.SENT,
      senderName: actorId ? "Studio Staff" : "System",
      attachments: mediaUrl
        ? {
            create: {
              type: "image",
              url: mediaUrl,
            },
          }
        : undefined,
    },
  });

  // 2. Dispatch via Channel Adapter (WhatsApp/Instagram or Mock)
  if (conversation.channel === ChannelType.WHATSAPP || conversation.channel === ChannelType.INSTAGRAM) {
    const adapter = getChannelAdapter(conversation.channel);
    try {
      if (mediaUrl) {
        await adapter.sendImageMessage(recipient, mediaUrl, content);
      } else {
        await adapter.sendTextMessage(recipient, content);
      }
    } catch (err) {
      console.warn(`Channel dispatch warning for ${conversation.channel}:`, err);
    }
  }

  // 3. Update Conversation metadata
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: content.slice(0, 150),
      status: ConversationStatus.WAITING_FOR_CUSTOMER,
    },
  });

  if (actorId) {
    await logAudit({
      userId: actorId,
      action: "message_sent",
      entityType: "conversation",
      entityId: conversationId,
      newValue: { preview: content.slice(0, 50), channel: conversation.channel },
    });
  }

  return message;
}

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
  actorId?: string
) {
  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: { status },
  });

  if (actorId) {
    await logAudit({
      userId: actorId,
      action: "status_change",
      entityType: "conversation",
      entityId: conversationId,
      newValue: { status },
    });
  }

  return updated;
}
