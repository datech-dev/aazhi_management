"use client";

import { IndianRupee, TrendingUp, ShoppingBag, Clock, Users, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ExecutiveKpiCardsProps {
  analytics: {
    totalCollected: number;
    totalOrderValue: number;
    totalOutstanding: number;
    averageOrderValue: number;
    transactionCount: number;
  };
  ltvAnalytics: {
    totalCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
  };
}

export function ExecutiveKpiCards({ analytics, ltvAnalytics }: ExecutiveKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Revenue Collected */}
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
            {formatCurrency(analytics.totalCollected)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Across {analytics.transactionCount} payments
          </p>
        </div>
      </div>

      {/* Average Order Value (AOV) */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border/60 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Average Order Value (AOV)
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-heading text-blue-600">
            {formatCurrency(analytics.averageOrderValue)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Average ticket size per order
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
            {formatCurrency(analytics.totalOutstanding)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Balance to collect on delivery
          </p>
        </div>
      </div>

      {/* Repeat Customer Rate */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border/60 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Repeat Client Retention
          </span>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-heading text-purple-600">
            {ltvAnalytics.repeatRate}%
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {ltvAnalytics.repeatCustomers} out of {ltvAnalytics.totalCustomers} clients repeat
          </p>
        </div>
      </div>
    </div>
  );
}
