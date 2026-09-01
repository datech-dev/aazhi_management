"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";
import {
  moveOrderKanbanStage,
  assignTailorToOrder,
} from "@/services/production.service";

export async function moveKanbanStageAction(orderId: string, newStatus: OrderStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please login to perform workshop actions." };
  }

  try {
    const updated = await moveOrderKanbanStage(orderId, newStatus, session.user.id);
    revalidatePath("/production");
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move stage.",
    };
  }
}

export async function assignTailorAction(orderId: string, tailorId: string | null) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please login to perform workshop actions." };
  }

  try {
    const updated = await assignTailorToOrder(orderId, tailorId, session.user.id);
    revalidatePath("/production");
    revalidatePath("/production/tailors");
    revalidatePath(`/orders/${orderId}`);
    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign tailor.",
    };
  }
}
