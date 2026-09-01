"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adjustStockAction } from "@/actions/inventory.actions";
import { PlusCircle, MinusCircle, Loader2, X, RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface StockAdjustmentModalProps {
  item: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    quantity: unknown;
  };
  onClose: () => void;
}

export function StockAdjustmentModal({ item, onClose }: StockAdjustmentModalProps) {
  const router = useRouter();
  const [type, setType] = useState<"STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "DAMAGED">("STOCK_IN");
  const [quantity, setQuantity] = useState<number>(1);
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError("Please enter a valid quantity greater than 0.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await adjustStockAction({
      inventoryItemId: item.id,
      type,
      quantity,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      router.refresh();
      onClose();
    } else {
      setError(res.error || "Failed to adjust stock.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-xl space-y-4 relative animate-in fade-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h3 className="text-base font-bold font-heading text-foreground">
            Adjust Stock: {item.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            SKU: <span className="font-mono">{item.sku}</span> • Current:{" "}
            <span className="font-bold text-foreground">
              {String(item.quantity)} {item.unit}
            </span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("STOCK_IN")}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                type === "STOCK_IN"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                  : "bg-muted/40 border-border text-foreground hover:bg-muted"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Stock In
            </button>

            <button
              type="button"
              onClick={() => setType("STOCK_OUT")}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                type === "STOCK_OUT"
                  ? "bg-amber-50 border-amber-500 text-amber-700"
                  : "bg-muted/40 border-border text-foreground hover:bg-muted"
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5" /> Stock Out
            </button>

            <button
              type="button"
              onClick={() => setType("ADJUSTMENT")}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                type === "ADJUSTMENT"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted/40 border-border text-foreground hover:bg-muted"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Set Absolute
            </button>

            <button
              type="button"
              onClick={() => setType("DAMAGED")}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                type === "DAMAGED"
                  ? "bg-destructive/10 border-destructive text-destructive"
                  : "bg-muted/40 border-border text-foreground hover:bg-muted"
              }`}
            >
              <X className="w-3.5 h-3.5" /> Mark Damaged
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {type === "ADJUSTMENT" ? "New Total Count" : "Quantity"} ({item.unit}) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Reference / Reason</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. PO-2026-88, Order #AZ-0012, or Supplier Roll"
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional tailor note or inspection remark..."
              className="w-full px-3 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
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
                className: "bg-primary text-primary-foreground",
              })}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : "Save Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
