import { prisma } from "@/lib/prisma";
import { ChannelType, ConversationStatus, MessageDirection, MessageStatus, NotificationType } from "@prisma/client";
import { IncomingMessagePayload } from "@/lib/messaging/types";

export async function processIncomingMessage(payload: IncomingMessagePayload) {
  const { channel, externalId, senderId, senderName, content, attachments, timestamp } = payload;

  const channelType = channel === "WHATSAPP" ? ChannelType.WHATSAPP : ChannelType.INSTAGRAM;

  // 1. Find or create Customer record based on channel sender info
  let customer = null;
  if (channelType === ChannelType.WHATSAPP) {
    const cleanedPhone = senderId.replace(/[\s\+\-]/g, "");
    customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { whatsappNumber: cleanedPhone },
          { phone: cleanedPhone },
          { whatsappNumber: `+${cleanedPhone}` },
          { phone: `+${cleanedPhone}` },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: senderName || `WhatsApp Customer (${cleanedPhone})`,
          whatsappNumber: cleanedPhone,
          phone: cleanedPhone,
          source: "WHATSAPP",
          preferredChannel: "WHATSAPP",
        },
      });
    }
  } else if (channelType === ChannelType.INSTAGRAM) {
    const igUsername = senderName || senderId;
    customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { instagramUsername: igUsername },
          { instagramUsername: senderId },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: senderName ? `@${senderName}` : `Instagram DM (${senderId.slice(0, 8)})`,
          instagramUsername: senderName || senderId,
          source: "INSTAGRAM",
          preferredChannel: "INSTAGRAM",
        },
      });
    }
  }

  // 2. Find active conversation or create new thread
  let conversation = await prisma.conversation.findFirst({
    where: {
      customerId: customer?.id,
      channel: channelType,
      isArchived: false,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        customerId: customer?.id,
        channel: channelType,
        status: ConversationStatus.OPEN,
        subject: customer?.fullName || `Incoming ${channel} message`,
        externalId: senderId,
        lastMessageAt: timestamp || new Date(),
        lastMessagePreview: content ? content.slice(0, 150) : "[Attachment]",
      },
    });
  }

  // 3. Deduplicate message by external provider message ID if supplied
  if (externalId) {
    const existingMessage = await prisma.message.findFirst({
      where: { externalId },
    });
    if (existingMessage) {
      return { duplicate: true, messageId: existingMessage.id };
    }
  }

  // 4. Save incoming Message into DB
  const createdMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: MessageDirection.INBOUND,
      content: content || null,
      externalId,
      status: MessageStatus.DELIVERED,
      senderName: senderName || customer?.fullName || senderId,
      senderIdentifier: senderId,
      createdAt: timestamp || new Date(),
      attachments:
        attachments && attachments.length > 0
          ? {
              create: attachments.map((att) => ({
                type: att.type,
                url: att.url || null,
                mimeType: att.mimeType,
              })),
            }
          : undefined,
    },
  });

  // 5. Update Conversation metadata & thread status to OPEN
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: timestamp || new Date(),
      lastMessagePreview: content ? content.slice(0, 150) : "[Media Attachment]",
      status: ConversationStatus.OPEN,
    },
  });

  // 6. Broadcast notification to active studio staff
  const staffMembers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  if (staffMembers.length > 0) {
    await prisma.notification.createMany({
      data: staffMembers.map((staff) => ({
        userId: staff.id,
        type: NotificationType.NEW_MESSAGE,
        title: `New ${channelType === ChannelType.WHATSAPP ? "WhatsApp" : "Instagram"} Message`,
        message: `${customer?.fullName || senderId}: ${content ? content.slice(0, 100) : "[Media Attachment]"}`,
        entityType: "conversation",
        entityId: conversation.id,
      })),
    });
  }

  return { success: true, messageId: createdMessage.id, conversationId: conversation.id };
}
