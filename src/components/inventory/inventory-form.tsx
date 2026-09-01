"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inventoryItemCreateSchema,
  InventoryItemCreateInput,
} from "@/lib/validations/inventory";
import { createInventoryItemAction } from "@/actions/inventory.actions";
import { Package, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface SupplierOption {
  id: string;
  name: string;
}

interface InventoryFormProps {
  suppliers: SupplierOption[];
}

export function InventoryForm({ suppliers }: InventoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryItemCreateInput>({
    resolver: zodResolver(inventoryItemCreateSchema) as any,
    defaultValues: {
      name: "",
      sku: "",
      type: "FABRIC",
      unit: "meters",
      quantity: 0,
      reorderThreshold: 5,
      costPerUnit: undefined,
      supplierId: "",
      location: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: InventoryItemCreateInput) => {
    setLoading(true);
    setError("");

    try {
      const res = await createInventoryItemAction(data);
      if (!res.success) {
        setError(res.error || "Failed to create inventory item.");
        setLoading(false);
        return;
      }
      router.push("/inventory");
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
          <Package className="w-4 h-4 text-primary" />
          Material & Fabric Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-foreground">
              Material / Fabric Name *
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Pure Raw Silk - Peacock Blue, Gold Zari Lace 2-inch"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Material SKU / Code *
            </label>
            <input
              type="text"
              {...register("sku")}
              placeholder="e.g. FAB-SLK-BLU"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.sku && (
              <p className="text-[11px] text-destructive">{errors.sku.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Material Type *</label>
            <select
              {...register("type")}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="FABRIC">Fabric (Silk, Organza, Net)</option>
              <option value="LINING">Lining Cloth</option>
              <option value="LACE">Lace & Borders</option>
              <option value="EMBELLISHMENT">Embellishments / Beads / Kundan</option>
              <option value="ZIPPERS">Zippers</option>
              <option value="HOOKS">Hooks & Eyes</option>
              <option value="THREADS">Embroidery / Stitching Threads</option>
              <option value="BUTTONS">Buttons</option>
              <option value="OTHER">Other Material</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Unit of Measurement *
            </label>
            <input
              type="text"
              {...register("unit")}
              placeholder="meters, pcs, rolls, packets"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Initial Quantity In Stock
            </label>
            <input
              type="number"
              step="0.1"
              {...register("quantity")}
              placeholder="0.0"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground font-bold focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Reorder Alert Threshold
            </label>
            <input
              type="number"
              step="0.1"
              {...register("reorderThreshold")}
              placeholder="5.0"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Cost Per Unit (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register("costPerUnit")}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Storage Location / Bin
            </label>
            <input
              type="text"
              {...register("location")}
              placeholder="e.g. Fabric Rack 2, Bin C"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Supplier</label>
            <select
              {...register("supplierId")}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Direct Store Purchase / None</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
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
            className: "bg-primary text-primary-foreground min-w-[120px]",
          })}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : (
            "Add Material"
          )}
        </button>
      </div>
    </form>
  );
}
