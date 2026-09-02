"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Printer,
  Ban,
  FileText,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Banknote,
  Building2,
} from "lucide-react";
import { voidPaymentAction } from "@/actions/payment.actions";
import { toast } from "sonner";

interface PaymentItem {
  id: string;
  paymentNumber: string;
  amount: number | any;
  method: "CASH" | "UPI" | "BANK_TRANSFER" | "CARD" | "OTHER";
  type: "ADVANCE" | "PARTIAL" | "FINAL" | "REFUND";
  referenceNumber: string | null;
  notes: string | null;
  createdAt: Date | string;
  isVoided: boolean;
  order: {
    id: string;
    orderNumber: string;
    total: number | any;
    balance: number | any;
    status: string;
  };
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
  };
  recordedBy: {
    id: string;
    name: string;
  };
}

interface PaymentLedgerTableProps {
  payments: PaymentItem[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function PaymentLedgerTable({ payments }: PaymentLedgerTableProps) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [voidingId, setVoidingId] = useState<string | null>(null);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === "ALL" || p.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const handleVoid = async (paymentId: string) => {
    const reason = window.prompt("Reason for voiding this payment?");
    if (!reason) return;

    setVoidingId(paymentId);
    try {
      const res = await voidPaymentAction(paymentId, reason);
      if (res.success) {
        toast.success("Payment voided successfully");
      } else {
        toast.error(res.error || "Failed to void payment");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setVoidingId(null);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "UPI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <QrCode className="w-3 h-3" /> UPI
          </span>
        );
      case "CASH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Banknote className="w-3 h-3" /> Cash
          </span>
        );
      case "CARD":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            <CreditCard className="w-3 h-3" /> Card
          </span>
        );
      case "BANK_TRANSFER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <Building2 className="w-3 h-3" /> Bank Transfer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20">
            {method}
          </span>
        );
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border/60 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/20">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search payment #, order #, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "UPI", "CASH", "CARD", "BANK_TRANSFER"].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                methodFilter === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {m === "ALL" ? "All Methods" : m.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border/60">
            <tr>
              <th className="px-4 py-3">Receipt / Payment #</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3 text-right">Amount (₹)</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No payment records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-muted/30 transition-colors ${
                    p.isVoided ? "opacity-50 bg-red-50/20" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{p.paymentNumber}</span>
                      {p.isVoided && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-sans">
                          Voided
                        </span>
                      )}
                    </div>
                    {p.referenceNumber && (
                      <p className="text-[11px] text-muted-foreground font-sans truncate">
                        Ref: {p.referenceNumber}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${p.order.id}`}
                      className="font-medium text-primary hover:underline font-mono text-xs"
                    >
                      {p.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground text-xs">{p.customer.fullName}</p>
                    {p.customer.phone && (
                      <p className="text-[11px] text-muted-foreground">{p.customer.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">{getMethodBadge(p.method)}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {formatCurrency(Number(p.amount))}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/payments/${p.id}/receipt`}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </Link>
                      {!p.isVoided && (
                        <button
                          onClick={() => handleVoid(p.id)}
                          disabled={voidingId === p.id}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Void Payment"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
