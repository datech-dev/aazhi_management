import { formatCurrency } from "@/lib/utils";
import { Package, AlertTriangle, XCircle, DollarSign, Layers } from "lucide-react";

interface InventoryStatsProps {
  stats: {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalStockValuation: number;
    fabricMetersCount: number;
    suppliersCount: number;
  };
}

export function InventoryStatsCards({ stats }: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Total Material Items
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-foreground">
          {stats.totalItems}
        </div>
        <p className="text-xs text-muted-foreground">
          Fabrics, linings, laces & embellishments
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Total Fabric In Stock
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-foreground">
          {stats.fabricMetersCount.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">meters</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Silks, organza, georgette & brocade
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Low Stock Alerts
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-amber-600">
          {stats.lowStockCount}
        </div>
        <p className="text-xs text-muted-foreground">
          Below reorder threshold point
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Inventory Valuation
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-foreground">
          {formatCurrency(stats.totalStockValuation)}
        </div>
        <p className="text-xs text-muted-foreground">
          Across {stats.suppliersCount} active fabric suppliers
        </p>
      </div>
    </div>
  );
}
