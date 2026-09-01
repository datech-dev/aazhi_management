"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderCreateSchema, OrderCreateInput } from "@/lib/validations/order";
import { createOrderAction } from "@/actions/order.actions";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  Scissors,
  Loader2,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface CustomerOption {
  id: string;
  fullName: string;
  phone: string | null;
  whatsappNumber: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  basePrice: number;
}

interface MeasurementProfileOption {
  id: string;
  customerId: string;
  template: {
    name: string;
  };
  version: number;
}

interface OrderBookingWizardProps {
  customers: CustomerOption[];
  products: ProductOption[];
  measurementProfiles: MeasurementProfileOption[];
  initialCustomerId?: string;
  initialProductId?: string;
}

export function OrderBookingWizard({
  customers,
  products,
  measurementProfiles,
  initialCustomerId,
  initialProductId,
}: OrderBookingWizardProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const matchedProduct = products.find((p) => p.id === initialProductId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderCreateInput>({
    resolver: zodResolver(orderCreateSchema) as any,
    defaultValues: {
      customerId: initialCustomerId || (customers[0]?.id || ""),
      priority: "MEDIUM",
      taxPercent: 5,
      discountAmount: 0,
      items: [
        {
          name: matchedProduct?.name || "Bespoke Bridal Blouse",
          productId: matchedProduct?.id || null,
          customizations: "Boat neck front, deep back with potli buttons, padding included.",
          unitPrice: matchedProduct?.basePrice || 4500,
          quantity: 1,
        },
      ],
      advancePayment: {
        amount: 2000,
        method: "UPI",
        notes: "Initial advance received via GPay/PhonePe",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedCustomerId = watch("customerId");
  const watchedItems = watch("items") || [];
  const watchedTaxPercent = watch("taxPercent") || 0;
  const watchedDiscount = watch("discountAmount") || 0;
  const watchedAdvance = watch("advancePayment.amount") || 0;

  // Filter measurement profiles for selected customer
  const customerMeasurements = measurementProfiles.filter(
    (m) => m.customerId === watchedCustomerId
  );

  // Live Calculation
  const subtotal = watchedItems.reduce((acc, item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const taxableAmount = Math.max(0, subtotal - (Number(watchedDiscount) || 0));
  const taxAmount = (taxableAmount * (Number(watchedTaxPercent) || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;
  const balanceDue = Math.max(0, grandTotal - (Number(watchedAdvance) || 0));

  const onSubmit = async (data: OrderCreateInput) => {
    setLoading(true);
    setError("");

    try {
      const res = await createOrderAction(data);
      if (!res.success || !res.data) {
        setError(res.error || "Failed to create order.");
        setLoading(false);
        return;
      }
      router.push(`/orders/${res.data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl">
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* 1. Client & Delivery Schedule */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" />
          Client &amp; Delivery Schedule
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-foreground">Boutique Customer *</label>
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
            <label className="text-xs font-medium text-foreground">Order Priority</label>
            <select
              {...register("priority")}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Standard Delivery</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Express Rush Order</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Target Delivery Date</label>
            <input
              type="date"
              {...register("expectedDeliveryDate", { valueAsDate: true })}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* 2. Multi-Item Line Builder */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
            <Scissors className="w-4 h-4 text-primary" />
            Garment Items ({fields.length})
          </h3>
          <button
            type="button"
            onClick={() =>
              append({
                name: "Custom Tailoring Item",
                customizations: "Standard lining, 1.5-inch inner margin",
                unitPrice: 2500,
                quantity: 1,
              })
            }
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Another Item
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="p-4 bg-muted/25 rounded-xl border border-border/80 space-y-3"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-foreground">Garment / Item Name *</label>
                  <input
                    type="text"
                    {...register(`items.${idx}.name` as const)}
                    placeholder="e.g. Peacock Blue Raw Silk Blouse with Zardosi Work"
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Link Customer Measurements
                  </label>
                  <select
                    {...register(`items.${idx}.measurementProfileId` as const)}
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">No linked measurement profile</option>
                    {customerMeasurements.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.template.name} (Version {m.version})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-medium text-foreground">
                    Customization &amp; Tailor Specs
                  </label>
                  <input
                    type="text"
                    {...register(`items.${idx}.customizations` as const)}
                    placeholder="e.g. Princess cut, sweetheart front neck 7.5″, elbow sleeve 10.5″, lining washed."
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="50"
                    {...register(`items.${idx}.unitPrice` as const, { valueAsNumber: true })}
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    {...register(`items.${idx}.quantity` as const, { valueAsNumber: true })}
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Financial Summary & Advance Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advance Payment Capture */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Advance Payment Booking
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Advance Amount (₹)</label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  {...register("advancePayment.amount", { valueAsNumber: true })}
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Payment Mode</label>
                <select
                  {...register("advancePayment.method")}
                  className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="BANK_TRANSFER">Bank NEFT / IMPS</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Transaction / Reference Number
              </label>
              <input
                type="text"
                {...register("advancePayment.referenceNumber")}
                placeholder="e.g. UPI/20260902/894123"
                className="w-full px-3 py-1.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Pricing Calculator Summary */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-3">
          <h3 className="font-semibold text-base font-heading text-foreground">
            Price &amp; Tax Calculation
          </h3>

          <div className="space-y-2 text-xs divide-y divide-border/60">
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Items Subtotal</span>
              <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">Order Discount (₹)</span>
              <input
                type="number"
                min="0"
                {...register("discountAmount", { valueAsNumber: true })}
                className="w-24 px-2 py-1 text-right text-xs bg-muted/40 border border-border rounded text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">GST Tax Rate</span>
              <select
                {...register("taxPercent", { valueAsNumber: true })}
                className="w-24 px-2 py-1 text-xs bg-muted/40 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="0">0% (Exempt)</option>
                <option value="5">5% (Standard)</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
              </select>
            </div>

            <div className="flex justify-between py-1.5 text-muted-foreground">
              <span>GST Amount</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>

            <div className="flex justify-between py-2 text-base font-bold text-foreground">
              <span>Grand Total</span>
              <span className="text-primary font-heading">{formatCurrency(grandTotal)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-xs font-semibold text-muted-foreground">
              <span>Advance Paid</span>
              <span className="text-emerald-600">
                {formatCurrency(Number(watchedAdvance) || 0)}
              </span>
            </div>

            <div className="flex justify-between py-2 text-sm font-bold text-destructive">
              <span>Balance Due at Delivery</span>
              <span className="font-mono">{formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
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
            className: "bg-primary text-primary-foreground min-w-[150px]",
          })}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Confirm &amp; Book Order
            </>
          )}
        </button>
      </div>
    </form>
  );
}
