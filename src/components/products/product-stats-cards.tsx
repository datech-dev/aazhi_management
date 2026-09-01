import { Sparkles, AlertTriangle, XCircle, Grid } from "lucide-react";

interface ProductStatsProps {
  stats: {
    totalProducts: number;
    customizableDesigns: number;
    lowStockItems: number;
    outOfStockItems: number;
    categoriesCount: number;
  };
}

export function ProductStatsCards({ stats }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Total Designs
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Grid className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-foreground">
          {stats.totalProducts}
        </div>
        <p className="text-xs text-muted-foreground">
          Across {stats.categoriesCount} active boutique categories
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Customizable Designs
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-foreground">
          {stats.customizableDesigns}
        </div>
        <p className="text-xs text-muted-foreground">
          Tailor-made with measurement profiling
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Low Stock Alert
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-amber-600">
          {stats.lowStockItems}
        </div>
        <p className="text-xs text-muted-foreground">
          5 or fewer pieces remaining
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Out of Stock
          </span>
          <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-destructive">
          {stats.outOfStockItems}
        </div>
        <p className="text-xs text-muted-foreground">
          Requires restocking or custom made-to-order
        </p>
      </div>
    </div>
  );
}
