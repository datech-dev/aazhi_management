"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { LeadStatus } from "@prisma/client";
import { createLead, updateLeadStatus, LeadCreateInput } from "@/services/lead.service";

export async function createLeadAction(data: LeadCreateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!data.customerId) {
    return { success: false, error: "Customer selection is required" };
  }

  try {
    const lead = await createLead(data, session.user.id);
    revalidatePath("/leads");
    return { success: true, lead };
  } catch (error) {
    console.error("Error creating lead:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create lead",
    };
  }
}

export async function updateLeadStatusAction(
  leadId: string,
  status: LeadStatus,
  notes?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const lead = await updateLeadStatus(leadId, status, notes, session.user.id);
    revalidatePath("/leads");
    return { success: true, lead };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update lead stage",
    };
  }
}
