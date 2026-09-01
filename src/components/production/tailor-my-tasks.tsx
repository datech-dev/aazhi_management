"use client";

import { useState } from "react";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { moveKanbanStageAction } from "@/actions/production.actions";
import { formatDate } from "@/lib/utils";
import {
  Scissors,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
  User,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface TailorMyTasksProps {
  orders: any[];
}

export function TailorMyTasks({ orders }: TailorMyTasksProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getNextStage = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case "CONFIRMED":
      case "MEASUREMENT_PENDING":
        return OrderStatus.CUTTING;
      case "CUTTING":
        return OrderStatus.STITCHING;
      case "STITCHING":
      case "ALTERATION":
        return OrderStatus.FINISHING;
      case "FINISHING":
        return OrderStatus.QUALITY_CHECK;
      case "QUALITY_CHECK":
        return OrderStatus.READY;
      default:
        return null;
    }
  };

  const handleAdvanceStage = async (orderId: string, nextStatus: OrderStatus) => {
    setLoadingId(orderId);
    try {
      await moveKanbanStageAction(orderId, nextStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold font-heading text-foreground">
          All caught up! No active tasks assigned.
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          You currently have no pending cutting or tailoring garments in your queue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const nextStage = getNextStage(order.status);
          const isUrgent = order.priority === "URGENT";

          return (
            <div
              key={order.id}
              className={`bg-card rounded-xl border p-6 shadow-sm space-y-4 flex flex-col justify-between ${
                isUrgent ? "border-destructive/40 ring-1 ring-destructive/20" : "border-border"
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-primary font-heading block">
                      {order.orderNumber}
                    </span>
                    <h3 className="font-bold text-base text-foreground mt-0.5">
                      {order.customer.fullName}
                    </h3>
                  </div>

                  {isUrgent ? (
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded uppercase">
                      Rush
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground uppercase">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  )}
                </div>

                {/* Delivery Date */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Delivery Due:{" "}
                    <strong className="text-foreground">
                      {order.expectedDeliveryDate
                        ? formatDate(order.expectedDeliveryDate)
                        : "Standard Turnaround"}
                    </strong>
                  </span>
                </div>

                {/* Garments List */}
                <div className="space-y-2 pt-2 border-t border-border/70">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block text-[10px]">
                    Garments to Craft ({order.items.length}):
                  </span>

                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 bg-muted/30 rounded-lg border border-border/60 space-y-1 text-xs"
                    >
                      <div className="font-bold text-foreground">
                        {item.quantity}x {item.description}
                      </div>
                      {item.customizations && (
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                          {item.customizations}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-border/70 flex items-center justify-between gap-2">
                {order.measurementProfile ? (
                  <Link
                    href={`/measurements/${order.measurementProfile.id}/print`}
                    target="_blank"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "text-xs font-semibold",
                    })}
                  >
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Cutting Sheet
                  </Link>
                ) : (
                  <Link
                    href={`/orders/${order.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "text-xs",
                    })}
                  >
                    View Specs
                  </Link>
                )}

                {nextStage && (
                  <button
                    type="button"
                    disabled={loadingId === order.id}
                    onClick={() => handleAdvanceStage(order.id, nextStage)}
                    className={buttonVariants({
                      variant: "default",
                      size: "sm",
                      className: "bg-primary text-primary-foreground text-xs font-semibold",
                    })}
                  >
                    {loadingId === order.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <>
                        Done: {nextStage.replace(/_/g, " ")} <ChevronRight className="w-3 h-3 ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
