"use client";

import { useState } from "react";
import { recordPaymentAction } from "@/actions/payment.actions";
import { toast } from "sonner";
import { X, IndianRupee, QrCode, Banknote, CreditCard, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  balanceDue: number;
  onSuccess?: () => void;
}

export function PaymentRecordModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  customerId,
  customerName,
  totalAmount,
  balanceDue,
  onSuccess,
}: PaymentRecordModalProps) {
  const [amount, setAmount] = useState<number | "">(balanceDue > 0 ? balanceDue : totalAmount);
  const [method, setMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER" | "CARD" | "OTHER">("UPI");
  const [type, setType] = useState<"ADVANCE" | "PARTIAL" | "FINAL">("PARTIAL");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = typeof amount === "number" ? amount : parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recordPaymentAction({
        orderId,
        customerId,
        amount: numAmount,
        method,
        type,
        referenceNumber,
        notes,
      });

      if (res.success) {
        toast.success(`Payment of ${formatCurrency(numAmount)} recorded successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    } catch {
      toast.error("An error occurred while saving the payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background text-foreground w-full max-w-md rounded-xl border border-border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-base font-bold font-heading">Record Payment</h2>
            <p className="text-xs text-muted-foreground">
              Order {orderNumber} • {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Summary Banner */}
          <div className="bg-muted/40 p-3 rounded-lg flex items-center justify-between text-xs border border-border/50">
            <div>
              <span className="text-muted-foreground">Order Total:</span>
              <p className="font-semibold text-foreground">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Balance Due:</span>
              <p className="font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(balanceDue)}
              </p>
            </div>
          </div>

          {/* Quick Amount Selection */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Payment Amount (₹)
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAmount(balanceDue)}
                className="flex-1 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 font-medium"
              >
                Full Balance ({formatCurrency(balanceDue)})
              </button>
              <button
                type="button"
                onClick={() => setAmount(Math.round(totalAmount * 0.5))}
                className="flex-1 py-1 text-xs rounded bg-muted hover:bg-muted/80 text-muted-foreground font-medium"
              >
                50% Advance ({formatCurrency(Math.round(totalAmount * 0.5))})
              </button>
            </div>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter amount in ₹"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "UPI", label: "UPI / GPay / PhonePe", icon: QrCode },
                { id: "CASH", label: "Cash", icon: Banknote },
                { id: "CARD", label: "Debit/Credit Card", icon: CreditCard },
                { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2 },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = method === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id as any)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Transaction Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="PARTIAL">Partial Payment</option>
              <option value="ADVANCE">Advance Deposit</option>
              <option value="FINAL">Final Settlement</option>
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              UPI Ref / Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UPI/3284910249"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
