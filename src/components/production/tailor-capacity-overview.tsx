import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Phone,
  Flame,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface TailorCapacityOverviewProps {
  tailors: {
    tailor: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      role: string;
    };
    activeOrdersCount: number;
    totalGarments: number;
    cuttingCount: number;
    stitchingCount: number;
    finishingCount: number;
    qcCount: number;
    urgentCount: number;
    utilizationPercent: number;
    activeOrders: any[];
  }[];
}

export function TailorCapacityOverview({ tailors }: TailorCapacityOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tailors.map((item) => {
          const isOverloaded = item.utilizationPercent >= 90;
          const isBusy = item.utilizationPercent >= 60 && item.utilizationPercent < 90;

          return (
            <div
              key={item.tailor.id}
              className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4 hover:shadow-md transition-all"
            >
              {/* Tailor Profile Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base font-heading text-foreground">
                    {item.tailor.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase">
                      {item.tailor.role.replace(/_/g, " ")}
                    </span>
                    {item.tailor.phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3" /> {item.tailor.phone}
                      </span>
                    )}
                  </div>
                </div>

                {item.urgentCount > 0 && (
                  <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                    <Flame className="w-3.5 h-3.5" /> {item.urgentCount} Rush
                  </span>
                )}
              </div>

              {/* Workload Capacity Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Workload Capacity</span>
                  <span
                    className={
                      isOverloaded
                        ? "text-destructive font-bold"
                        : isBusy
                        ? "text-amber-600 font-bold"
                        : "text-emerald-600 font-bold"
                    }
                  >
                    {item.totalGarments} / 8 Garments ({item.utilizationPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${
                      isOverloaded
                        ? "bg-destructive"
                        : isBusy
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${item.utilizationPercent}%` }}
                  />
                </div>
              </div>

              {/* Garment Stage Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2 text-center py-2 bg-muted/30 rounded-lg border border-border/60 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Cutting
                  </span>
                  <span className="font-bold text-foreground text-sm font-heading">
                    {item.cuttingCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Stitching
                  </span>
                  <span className="font-bold text-foreground text-sm font-heading">
                    {item.stitchingCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    Finishing
                  </span>
                  <span className="font-bold text-foreground text-sm font-heading">
                    {item.finishingCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                    QC Check
                  </span>
                  <span className="font-bold text-foreground text-sm font-heading">
                    {item.qcCount}
                  </span>
                </div>
              </div>

              {/* Active Orders List Preview */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <span className="text-xs font-semibold text-foreground block">
                  Assigned Orders ({item.activeOrders.length}):
                </span>

                {item.activeOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No active orders assigned.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {item.activeOrders.slice(0, 4).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-2 rounded bg-card border border-border/70 text-xs"
                      >
                        <div>
                          <Link
                            href={`/orders/${order.id}`}
                            className="font-bold text-primary hover:underline font-heading flex items-center gap-1"
                          >
                            {order.orderNumber}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[140px] block">
                            {order.customer.fullName} • {order.items.length} items
                          </span>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted font-semibold text-foreground uppercase">
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                    {item.activeOrders.length > 4 && (
                      <p className="text-[11px] text-muted-foreground text-center">
                        + {item.activeOrders.length - 4} more orders
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
