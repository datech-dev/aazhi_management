"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationCreateSchema, QuotationCreateInput } from "@/lib/validations/order";
import { createQuotationAction } from "@/actions/order.actions";
import { formatCurrency } from "@/lib/utils";
import { FileText, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface CustomerOption {
  id: string;
  fullName: string;
  phone: string | null;
}

interface QuotationFormProps {
  customers: CustomerOption[];
}

export function QuotationForm({ customers }: QuotationFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuotationCreateInput>({
    resolver: zodResolver(quotationCreateSchema) as any,
    defaultValues: {
      customerId: customers[0]?.id || "",
      taxPercent: 5,
      discountAmount: 0,
      items: [
        {
          description: "Bridal Lehenga Set (Silk blouse + Kali skirt + Net dupatta)",
          unitPrice: 18500,
          quantity: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items") || [];
  const watchedTaxPercent = watch("taxPercent") || 0;
  const watchedDiscount = watch("discountAmount") || 0;

  const subtotal = watchedItems.reduce((acc, item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const taxableAmount = Math.max(0, subtotal - (Number(watchedDiscount) || 0));
  const taxAmount = (taxableAmount * (Number(watchedTaxPercent) || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const onSubmit = async (data: QuotationCreateInput) => {
    setLoading(true);
    setError("");

    try {
      const res = await createQuotationAction(data);
      if (!res.success) {
        setError(res.error || "Failed to create quotation.");
        setLoading(false);
        return;
      }
      router.push("/quotations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Client &amp; Quotation Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Customer *</label>
            <select
              {...register("customerId")}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Estimate Valid Until</label>
            <input
              type="date"
              {...register("validUntil", { valueAsDate: true })}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-foreground">Quotation Terms / Notes</label>
            <textarea
              rows={2}
              {...register("notes")}
              placeholder="e.g. 50% advance upon confirmation, fabric sample approval required before embroidery starts."
              className="w-full px-3 py-2 text-xs bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Items line builder */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base font-heading text-foreground">
            Estimate Line Items ({fields.length})
          </h3>
          <button
            type="button"
            onClick={() =>
              append({
                description: "Custom Tailoring Item",
                unitPrice: 3500,
                quantity: 1,
              })
            }
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="p-4 bg-muted/30 rounded-xl border border-border/70 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Item #{idx + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <input
                    type="text"
                    {...register(`items.${idx}.description` as const)}
                    placeholder="Description &amp; inclusions (e.g. Pure raw silk, gold zari border)"
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <input
                    type="number"
                    step="50"
                    {...register(`items.${idx}.unitPrice` as const, { valueAsNumber: true })}
                    placeholder="Unit Price (₹)"
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-border/70 flex items-center justify-between text-sm">
          <div className="text-xs text-muted-foreground">
            Standard 5% GST included in estimate calculations
          </div>
          <div className="text-right space-y-1">
            <div className="text-xs text-muted-foreground">Subtotal: {formatCurrency(subtotal)}</div>
            <div className="text-lg font-bold font-heading text-primary">
              Estimated Total: {formatCurrency(grandTotal)}
            </div>
          </div>
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
            className: "bg-primary text-primary-foreground min-w-[140px]",
          })}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate Quotation
            </>
          )}
        </button>
      </div>
    </form>
  );
}
