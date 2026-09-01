"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  measurementTemplateCreateSchema,
  MeasurementTemplateCreateInput,
} from "@/lib/validations/measurement";
import {
  createMeasurementTemplateAction,
  updateMeasurementTemplateAction,
} from "@/actions/measurement.actions";
import { Layers, Plus, Trash2, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface TemplateFormProps {
  initialData?: MeasurementTemplateCreateInput & { id?: string };
  isEditing?: boolean;
}

export function TemplateForm({ initialData, isEditing = false }: TemplateFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MeasurementTemplateCreateInput>({
    resolver: zodResolver(measurementTemplateCreateSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "Tops",
      isActive: initialData?.isActive ?? true,
      fields: initialData?.fields || [
        { name: "Length", key: "length", unit: "INCHES", isRequired: true, sortOrder: 1 },
        { name: "Bust / Chest", key: "bust", unit: "INCHES", isRequired: true, sortOrder: 2 },
        { name: "Waist", key: "waist", unit: "INCHES", isRequired: true, sortOrder: 3 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const onSubmit = async (data: MeasurementTemplateCreateInput) => {
    setLoading(true);
    setError("");

    try {
      if (isEditing && initialData?.id) {
        const res = await updateMeasurementTemplateAction(initialData.id, data);
        if (!res.success) {
          setError(res.error || "Failed to update template.");
          setLoading(false);
          return;
        }
      } else {
        const res = await createMeasurementTemplateAction(data);
        if (!res.success) {
          setError(res.error || "Failed to create template.");
          setLoading(false);
          return;
        }
      }
      router.push("/measurements/templates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Template Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Template / Garment Name *
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Bridal Gown, Saree Petticoat, Indo-Western"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Category Group</label>
            <input
              type="text"
              {...register("category")}
              placeholder="e.g. Tops, Bottoms, Full Dresses"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Fields List */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base font-heading text-foreground">
            Measurement Dimensions & Points ({fields.length})
          </h3>
          <button
            type="button"
            onClick={() =>
              append({
                name: "",
                key: "",
                unit: "INCHES",
                isRequired: true,
                sortOrder: fields.length + 1,
              })
            }
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Field Point
          </button>
        </div>

        <div className="space-y-2.5">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-muted/30 rounded-lg border border-border/60 items-center"
            >
              <div className="sm:col-span-5">
                <input
                  type="text"
                  {...register(`fields.${idx}.name` as const)}
                  placeholder="Field Name (e.g. Front Neck Depth)"
                  className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  {...register(`fields.${idx}.key` as const)}
                  placeholder="Key (e.g. front_neck_depth)"
                  className="w-full px-2.5 py-1.5 text-xs bg-card border border-border rounded text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-1">
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(`fields.${idx}.isRequired` as const)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  Required
                </label>
              </div>

              <div className="sm:col-span-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className: "bg-primary text-primary-foreground min-w-[120px]",
          })}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Template"
          )}
        </button>
      </div>
    </form>
  );
}
