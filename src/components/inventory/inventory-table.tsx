"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StockAdjustmentModal } from "./stock-adjustment-modal";
import { AlertTriangle, PlusCircle, Layers, MapPin, Edit, Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface InventoryItemData {
  id: string;
  name: string;
  sku: string;
  type: string;
  unit: string;
  quantity: unknown;
  reorderThreshold: unknown;
  costPerUnit: unknown;
  location: string | null;
  createdAt: Date;
  supplier: { id: string; name: string; phone: string | null } | null;
  _count: { transactions: number };
}

interface InventoryTableProps {
  items: InventoryItemData[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItemData | null>(null);

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold font-heading text-foreground">
          No inventory materials found
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Add fabrics, lining cloths, embroidery laces, or embellishments to start tracking your boutique stock.
        </p>
        <div className="mt-4">
          <Link
            href="/inventory/new"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-primary text-primary-foreground",
            })}
          >
            Add First Material
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">In Stock</th>
                <th className="py-3 px-4 text-right">Cost / Unit</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => {
                const qty = Number(item.quantity);
                const threshold = Number(item.reorderThreshold);
                const isLow = qty > 0 && qty <= threshold;
                const isOut = qty === 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Name & SKU */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground font-heading">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {item.sku}
                      </div>
                    </td>

                    {/* Material Type */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                        {item.type}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground/60" />
                          {item.location}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>

                    {/* Quantity & Stock status */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-sm text-foreground">
                        {qty} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                      </div>
                      {isOut ? (
                        <span className="text-[10px] font-bold text-destructive">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center justify-end gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Low (≤{threshold})
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Adequate
                        </span>
                      )}
                    </td>

                    {/* Cost Per Unit */}
                    <td className="py-3 px-4 text-right font-medium text-foreground">
                      {item.costPerUnit ? (
                        formatCurrency(Number(item.costPerUnit))
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.supplier ? item.supplier.name : "Direct Purchase"}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10",
                          })}
                        >
                          <PlusCircle className="w-3 h-3 mr-1" />
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Adjustment Modal */}
      {selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
