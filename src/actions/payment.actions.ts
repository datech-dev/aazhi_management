"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { paymentCreateSchema, PaymentCreateInput } from "@/lib/validations/payment";
import { recordPayment, voidPayment, processRefund } from "@/services/payment.service";

export async function recordPaymentAction(data: PaymentCreateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = paymentCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const payment = await recordPayment(parsed.data, session.user.id);
    revalidatePath("/payments");
    revalidatePath("/orders");
    revalidatePath(`/orders/${parsed.data.orderId}`);
    return { success: true, payment };
  } catch (error) {
    console.error("Error recording payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record payment",
    };
  }
}

export async function voidPaymentAction(paymentId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!paymentId || !reason?.trim()) {
    return { success: false, error: "Payment ID and void reason are required" };
  }

  try {
    const payment = await voidPayment(paymentId, reason, session.user.id);
    revalidatePath("/payments");
    revalidatePath("/orders");
    return { success: true, payment };
  } catch (error) {
    console.error("Error voiding payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to void payment",
    };
  }
}

export async function processRefundAction(paymentId: string, refundAmount: number, reason: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!paymentId || !refundAmount || refundAmount <= 0) {
    return { success: false, error: "Valid payment ID and positive refund amount are required" };
  }

  try {
    const refund = await processRefund(paymentId, refundAmount, reason, session.user.id);
    revalidatePath("/payments");
    return { success: true, refund };
  } catch (error) {
    console.error("Error processing refund:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process refund",
    };
  }
}
