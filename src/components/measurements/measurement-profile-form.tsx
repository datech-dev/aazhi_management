"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  createMeasurementProfileAction,
  updateMeasurementProfileAction,
} from "@/actions/measurement.actions";
import { Ruler, Loader2, Scissors, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface CustomerOption {
  id: string;
  fullName: string;
  phone: string | null;
}

interface TemplateField {
  id: string;
  name: string;
  key: string;
  unit: string;
  isRequired: boolean;
  description: string | null;
}

interface TemplateOption {
  id: string;
  name: string;
  category: string | null;
  fields: TemplateField[];
}

interface MeasurementProfileFormProps {
  customers: CustomerOption[];
  templates: TemplateOption[];
  initialCustomerId?: string;
  initialTemplateId?: string;
  initialData?: {
    id?: string;
    customerId: string;
    templateId: string;
    unit: "INCHES" | "CENTIMETERS";
    notes?: string | null;
    orderId?: string | null;
    values: { fieldKey: string; value: number }[];
  };
  isEditing?: boolean;
}

export function MeasurementProfileForm({
  customers,
  templates,
  initialCustomerId,
  initialTemplateId,
  initialData,
  isEditing = false,
}: MeasurementProfileFormProps) {
  const router = useRouter();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialData?.customerId || initialCustomerId || (customers[0]?.id || "")
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialData?.templateId || initialTemplateId || (templates[0]?.id || "")
  );

  const [unit, setUnit] = useState<"INCHES" | "CENTIMETERS">(
    initialData?.unit || "INCHES"
  );

  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Map of field key to value
  const initialValuesMap: Record<string, number> = {};
  initialData?.values.forEach((v) => {
    initialValuesMap[v.fieldKey] = Number(v.value);
  });

  const [fieldValues, setFieldValues] = useState<Record<string, number | "">>(
    initialValuesMap
  );

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleValueChange = (key: string, val: string) => {
    const num = val === "" ? "" : parseFloat(val);
    setFieldValues((prev) => ({
      ...prev,
      [key]: num,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError("Please select a customer.");
      return;
    }
    if (!currentTemplate) {
      setError("Please select a measurement template.");
      return;
    }

    // Build values array
    const valuesArray = currentTemplate.fields.map((f) => ({
      fieldKey: f.key,
      value: typeof fieldValues[f.key] === "number" ? Number(fieldValues[f.key]) : 0,
    }));

    setLoading(true);
    setError("");

    try {
      if (isEditing && initialData?.id) {
        const res = await updateMeasurementProfileAction(initialData.id, {
          customerId: selectedCustomerId,
          templateId: selectedTemplateId,
          unit,
          notes: notes.trim() || undefined,
          values: valuesArray,
        });

        if (!res.success) {
          setError(res.error || "Failed to update measurements.");
          setLoading(false);
          return;
        }
        router.push(`/measurements/${initialData.id}`);
      } else {
        const res = await createMeasurementProfileAction({
          customerId: selectedCustomerId,
          templateId: selectedTemplateId,
          unit,
          notes: notes.trim() || undefined,
          values: valuesArray,
        });

        if (!res.success) {
          setError(res.error || "Failed to save measurements.");
          setLoading(false);
          return;
        }
        router.push(`/customers/${selectedCustomerId}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* 1. Client & Template Selection */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" />
          Client & Garment Profile Selection
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-foreground">Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Select Boutique Client</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Garment Template *
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                setFieldValues({});
              }}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Units Switcher */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            Standard boutique tailor measuring unit
          </div>

          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setUnit("INCHES")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                unit === "INCHES"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inches (&quot;)
            </button>
            <button
              type="button"
              onClick={() => setUnit("CENTIMETERS")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                unit === "CENTIMETERS"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Measurement Dimensions */}
      {currentTemplate && (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
              <Scissors className="w-4 h-4 text-primary" />
              {currentTemplate.name} Dimensional Measurements ({unit})
            </h3>
            <span className="text-xs text-muted-foreground">
              {currentTemplate.fields.length} standard points
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
            {currentTemplate.fields.map((field) => (
              <div
                key={field.id}
                className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1.5 focus-within:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground truncate" title={field.name}>
                    {field.name}
                  </label>
                  {field.isRequired && (
                    <span className="text-[10px] text-destructive font-bold">*</span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="0.00"
                    value={fieldValues[field.key] ?? ""}
                    onChange={(e) => handleValueChange(field.key, e.target.value)}
                    className="w-full pl-2.5 pr-6 py-1.5 text-sm bg-card border border-border rounded-lg text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    required={field.isRequired}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold pointer-events-none">
                    {unit === "INCHES" ? "″" : "cm"}
                  </span>
                </div>

                {field.description && (
                  <p className="text-[10px] text-muted-foreground truncate" title={field.description}>
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Tailor Cutting Notes & Styling Instructions */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
        <h3 className="font-semibold text-base font-heading text-foreground">
          Master Tailor Cutting Instructions
        </h3>
        <p className="text-xs text-muted-foreground">
          Include special neckline shapes (Boat neck, Sweetheart, Deep V), cup padding details, back hook vs side zipper, and sleeve ease.
        </p>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Front deep U-neck 7.5 inches, Back sheer net with potli buttons, 1.5-inch inner margin seam allowance on both sides."
          className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
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
            className: "bg-primary text-primary-foreground min-w-[130px]",
          })}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : isEditing ? (
            "Update Profile"
          ) : (
            "Save Measurements"
          )}
        </button>
      </div>
    </form>
  );
}
