"use client";

import { CreditCard, IndianRupee, ArrowUpRight, Clock, QrCode } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialSummaryProps {
  summary: {
    totalCollected: number;
    totalAdvance: number;
    totalOutstanding: number;
    transactionCount: number;
    byMethod: {
      CASH: number;
      UPI: number;
      BANK_TRANSFER: number;
      CARD: number;
      OTHER: number;
    };
  };
}

export function FinancialSummaryCards({ summary }: FinancialSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Collected */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border/60 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Revenue Collected
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-heading text-emerald-600">
            {formatCurrency(summary.totalCollected)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Across {summary.transactionCount} transactions
          </p>
        </div>
      </div>

      {/* Advance Held */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border/60 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Advance Payments
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-heading text-blue-600">
            {formatCurrency(summary.totalAdvance)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Advance deposits on open orders
          </p>
        </div>
      </div>

      {/* Outstanding Balance */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border/60 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Outstanding Due
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-heading text-amber-600">
            {formatCurrency(summary.totalOutstanding)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Balance to collect on delivery
          </p>
        </div>
      </div>

      {/* UPI vs Cash Ratio */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border/60 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Payment Method Split
          </span>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">UPI / Online:</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(summary.byMethod.UPI + summary.byMethod.BANK_TRANSFER)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cash:</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(summary.byMethod.CASH)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Card / Other:</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(summary.byMethod.CARD + summary.byMethod.OTHER)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
