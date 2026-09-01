"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  orderCreateSchema,
  orderStatusUpdateSchema,
  orderPaymentRecordSchema,
  quotationCreateSchema,
  OrderCreateInput,
  OrderStatusUpdateInput,
  OrderPaymentRecordInput,
  QuotationCreateInput,
} from "@/lib/validations/order";
import {
  createOrder,
  updateOrderStatus,
  recordOrderPayment,
  createQuotation,
} from "@/services/order.service";
import { OrderStatus } from "@prisma/client";

export async function createOrderAction(data: OrderCreateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = orderCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const order = await createOrder(parsed.data, session.user.id);
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath(`/customers/${data.customerId}`);
    return { success: true, data: order };
  } catch (error) {
    console.error("Failed to create order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order.",
    };
  }
}

export async function updateOrderStatusAction(id: string, data: OrderStatusUpdateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = orderStatusUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const order = await updateOrderStatus(
      id,
      parsed.data.status as OrderStatus,
      parsed.data.notes,
      session.user.id
    );
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/dashboard");
    return { success: true, data: order };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status.",
    };
  }
}

export async function recordOrderPaymentAction(data: OrderPaymentRecordInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = orderPaymentRecordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const payment = await recordOrderPayment(parsed.data, session.user.id);
    revalidatePath("/orders");
    revalidatePath(`/orders/${data.orderId}`);
    return { success: true, data: payment };
  } catch (error) {
    console.error("Failed to record payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record payment.",
    };
  }
}

export async function createQuotationAction(data: QuotationCreateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = quotationCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const quotation = await createQuotation(parsed.data, session.user.id);
    revalidatePath("/quotations");
    revalidatePath(`/customers/${data.customerId}`);
    return { success: true, data: quotation };
  } catch (error) {
    console.error("Failed to create quotation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create quotation.",
    };
  }
}
