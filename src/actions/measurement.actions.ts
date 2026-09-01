"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  measurementTemplateCreateSchema,
  measurementTemplateUpdateSchema,
  measurementProfileCreateSchema,
  measurementProfileUpdateSchema,
  MeasurementTemplateCreateInput,
  MeasurementTemplateUpdateInput,
  MeasurementProfileCreateInput,
  MeasurementProfileUpdateInput,
} from "@/lib/validations/measurement";
import {
  createMeasurementTemplate,
  updateMeasurementTemplate,
  createMeasurementProfile,
  updateMeasurementProfile,
  deleteMeasurementProfile,
} from "@/services/measurement.service";

export async function createMeasurementTemplateAction(data: MeasurementTemplateCreateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = measurementTemplateCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const template = await createMeasurementTemplate(parsed.data, session.user.id);
    revalidatePath("/measurements/templates");
    revalidatePath("/measurements/new");
    return { success: true, data: template };
  } catch (error) {
    console.error("Failed to create template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create measurement template.",
    };
  }
}

export async function updateMeasurementTemplateAction(
  id: string,
  data: MeasurementTemplateUpdateInput
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = measurementTemplateUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const template = await updateMeasurementTemplate(id, parsed.data, session.user.id);
    revalidatePath("/measurements/templates");
    revalidatePath("/measurements/new");
    return { success: true, data: template };
  } catch (error) {
    console.error("Failed to update template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update measurement template.",
    };
  }
}

export async function createMeasurementProfileAction(data: MeasurementProfileCreateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = measurementProfileCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const profile = await createMeasurementProfile(parsed.data, session.user.id);
    revalidatePath("/measurements");
    revalidatePath(`/customers/${data.customerId}`);
    return { success: true, data: profile };
  } catch (error) {
    console.error("Failed to create measurement profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save client measurements.",
    };
  }
}

export async function updateMeasurementProfileAction(
  id: string,
  data: MeasurementProfileUpdateInput
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const parsed = measurementProfileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const profile = await updateMeasurementProfile(id, parsed.data, session.user.id);
    revalidatePath("/measurements");
    revalidatePath(`/measurements/${id}`);
    if (data.customerId) {
      revalidatePath(`/customers/${data.customerId}`);
    }
    return { success: true, data: profile };
  } catch (error) {
    console.error("Failed to update measurement profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client measurements.",
    };
  }
}

export async function deleteMeasurementProfileAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const profile = await deleteMeasurementProfile(id, session.user.id);
    revalidatePath("/measurements");
    revalidatePath(`/customers/${profile.customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete measurement profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete measurement profile.",
    };
  }
}
