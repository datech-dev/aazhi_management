"use server";

import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  customerCreateSchema,
  customerUpdateSchema,
  CustomerCreateInput,
  CustomerUpdateInput,
} from "@/lib/validations/customer";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerNote,
} from "@/services/customer.service";

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createCustomerAction(
  input: CustomerCreateInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAuth();
    const validated = customerCreateSchema.parse(input);

    const customer = await createCustomer(validated, user.id, user.branchId);

    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true, data: { id: customer.id } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create customer";
    return { success: false, error: message };
  }
}

export async function updateCustomerAction(
  id: string,
  input: CustomerUpdateInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAuth();
    const validated = customerUpdateSchema.parse(input);

    const customer = await updateCustomer(id, validated, user.id);

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    revalidatePath("/");

    return { success: true, data: { id: customer.id } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update customer";
    return { success: false, error: message };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    await deleteCustomer(id, user.id);

    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete customer";
    return { success: false, error: message };
  }
}

export async function addCustomerNoteAction(
  customerId: string,
  content: string
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();
    if (!content || !content.trim()) {
      return { success: false, error: "Note content cannot be empty" };
    }

    await addCustomerNote(customerId, content, user.id);

    revalidatePath(`/customers/${customerId}`);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add note";
    return { success: false, error: message };
  }
}
