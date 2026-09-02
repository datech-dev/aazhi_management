"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateBusinessSettings } from "@/services/settings.service";

export async function updateBusinessSettingsAction(settings: Record<string, string>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    await updateBusinessSettings(settings, session.user.id);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update business settings",
    };
  }
}
