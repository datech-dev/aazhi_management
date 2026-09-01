"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  inventoryItemCreateSchema,
  inventoryItemUpdateSchema,
  stockAdjustmentSchema,
  InventoryItemCreateInput,
  InventoryItemUpdateInput,
  StockAdjustmentInput,
} from "@/lib/validations/inventory";
import {
  createInventoryItem,
  updateInventoryItem,
  recordStockAdjustment,
  deleteInventoryItem,
} from "@/services/inventory.service";

export async function createInventoryItemAction(data: InventoryItemCreateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = inventoryItemCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const item = await createInventoryItem(parsed.data, session.user.id);
    revalidatePath("/inventory");
    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create inventory item.",
    };
  }
}

export async function updateInventoryItemAction(id: string, data: InventoryItemUpdateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = inventoryItemUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const item = await updateInventoryItem(id, parsed.data, session.user.id);
    revalidatePath("/inventory");
    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to update inventory item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inventory item.",
    };
  }
}

export async function adjustStockAction(data: StockAdjustmentInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = stockAdjustmentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await recordStockAdjustment(parsed.data, session.user.id);
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to adjust stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to adjust stock.",
    };
  }
}

export async function deleteInventoryItemAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    await deleteInventoryItem(id, session.user.id);
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete inventory item.",
    };
  }
}
