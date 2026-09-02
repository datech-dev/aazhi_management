"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ConversationStatus } from "@prisma/client";
import { sendMessage, updateConversationStatus } from "@/services/conversation.service";
import { createLead } from "@/services/lead.service";

export async function sendMessageAction(
  conversationId: string,
  content: string,
  mediaUrl?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!conversationId || !content?.trim()) {
    return { success: false, error: "Message content cannot be empty" };
  }

  try {
    const message = await sendMessage(conversationId, content, mediaUrl, session.user.id);
    revalidatePath("/inbox");
    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

export async function updateConversationStatusAction(
  conversationId: string,
  status: ConversationStatus
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const updated = await updateConversationStatus(conversationId, status, session.user.id);
    revalidatePath("/inbox");
    return { success: true, conversation: updated };
  } catch (error) {
    console.error("Error updating conversation status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update thread status",
    };
  }
}

export async function convertConversationToLeadAction(
  conversationId: string,
  customerId: string,
  enquiryMessage?: string,
  estimatedValue?: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const lead = await createLead(
      {
        customerId,
        enquiryMessage,
        estimatedValue,
      },
      session.user.id
    );

    await updateConversationStatus(conversationId, ConversationStatus.CONVERTED, session.user.id);

    revalidatePath("/inbox");
    revalidatePath("/leads");
    return { success: true, lead };
  } catch (error) {
    console.error("Error converting conversation to lead:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to convert to lead",
    };
  }
}
