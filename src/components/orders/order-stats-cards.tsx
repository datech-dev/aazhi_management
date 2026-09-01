import { ShoppingBag, Scissors, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface OrderStatsProps {
  stats: {
    activeOrders: number;
    inProduction: number;
    readyForTrial: number;
    urgentOrders: number;
    monthlyDelivered: number;
  };
}

export function OrderStatsCards({ stats }: OrderStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Active Orders
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-foreground">
          {stats.activeOrders}
        </div>
        <p className="text-xs text-muted-foreground">Live boutique bookings</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            In Workshop
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Scissors className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-amber-600">
          {stats.inProduction}
        </div>
        <p className="text-xs text-muted-foreground">Cutting &amp; stitching</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Ready for Trial
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-purple-600">
          {stats.readyForTrial}
        </div>
        <p className="text-xs text-muted-foreground">Client fitting pending</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Rush / Urgent
          </span>
          <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-destructive">
          {stats.urgentOrders}
        </div>
        <p className="text-xs text-muted-foreground">Priority express delivery</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Delivered Month
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-emerald-600">
          {stats.monthlyDelivered}
        </div>
        <p className="text-xs text-muted-foreground">Completed &amp; handed over</p>
      </div>
    </div>
  );
}
