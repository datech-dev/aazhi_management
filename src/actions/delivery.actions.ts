"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { DeliveryStatus, DeliveryMethod } from "@prisma/client";
import { scheduleDelivery, updateDeliveryStatus, ScheduleDeliveryInput } from "@/services/delivery.service";

export async function scheduleDeliveryAction(data: ScheduleDeliveryInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const delivery = await scheduleDelivery(data, session.user.id);
    revalidatePath("/deliveries");
    revalidatePath(`/orders/${data.orderId}`);
    return { success: true, delivery };
  } catch (error) {
    console.error("Error scheduling delivery:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to schedule delivery",
    };
  }
}

export async function updateDeliveryStatusAction(
  deliveryId: string,
  status: DeliveryStatus,
  trackingNumber?: string,
  courierName?: string,
  notes?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const delivery = await updateDeliveryStatus(
      deliveryId,
      status,
      trackingNumber,
      courierName,
      notes,
      session.user.id
    );
    revalidatePath("/deliveries");
    revalidatePath("/orders");
    return { success: true, delivery };
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update delivery status",
    };
  }
}
