"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  productCreateSchema,
  productUpdateSchema,
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/validations/product";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";

export async function createProductAction(data: ProductCreateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = productCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await createProduct(parsed.data, session.user.id);
    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, data: product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product.",
    };
  }
}

export async function updateProductAction(id: string, data: ProductUpdateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = productUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const product = await updateProduct(id, parsed.data, session.user.id);
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true, data: product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update product.",
    };
  }
}

export async function deleteProductAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    await deleteProduct(id, session.user.id);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete product.",
    };
  }
}
