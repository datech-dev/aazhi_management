"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  createStaffUser,
  updateStaffRole,
  toggleStaffStatus,
  updateUserPermissions,
  CreateStaffUserInput,
} from "@/services/staff.service";

export async function createStaffUserAction(data: CreateStaffUserInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!data.email || !data.name || !data.password) {
    return { success: false, error: "Email, Name, and Password are required" };
  }

  try {
    const user = await createStaffUser(data, session.user.id);
    revalidatePath("/staff");
    return { success: true, user };
  } catch (error) {
    console.error("Error creating staff user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create staff user",
    };
  }
}

export async function updateStaffRoleAction(userId: string, role: UserRole) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const user = await updateStaffRole(userId, role, session.user.id);
    revalidatePath("/staff");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating staff role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

export async function toggleStaffStatusAction(userId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const user = await toggleStaffStatus(userId, isActive, session.user.id);
    revalidatePath("/staff");
    return { success: true, user };
  } catch (error) {
    console.error("Error toggling staff status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

export async function updateUserPermissionsAction(userId: string, permissionIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    await updateUserPermissions(userId, permissionIds, session.user.id);
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Error updating user permissions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update permissions",
    };
  }
}
