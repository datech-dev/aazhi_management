import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { ShoppingBag, Plus, Calendar, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface OrdersTabProps {
  customerId: string;
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    priority: string;
    total: unknown;
    advancePaid: unknown;
    balance: unknown;
    expectedDeliveryDate: Date | null;
    createdAt: Date;
    items: {
      id: string;
      description: string;
      unitPrice: unknown;
      totalPrice: unknown;
    }[];
  }[];
}

export function OrdersTab({ customerId, orders }: OrdersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold font-heading text-foreground">
            Client Order History ({orders.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Boutique custom orders, tailoring progress, and invoice history
          </p>
        </div>
        <Link
          href={`/orders/new?customerId=${customerId}`}
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className: "text-xs bg-primary text-primary-foreground hover:bg-primary/90",
          })}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Create New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold font-heading text-foreground">
            No orders placed yet
          </h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            This client does not have any active or past garment orders.
          </p>
          <div className="mt-4">
            <Link
              href={`/orders/new?customerId=${customerId}`}
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground",
              })}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Book First Order
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-xl border border-border p-4 shadow-sm hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-bold text-primary hover:underline text-sm font-heading"
                  >
                    {order.orderNumber}
                  </Link>
                  <StatusBadge status={order.status} />
                  {order.priority === "URGENT" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                      Urgent
                    </span>
                  )}
                </div>

                <p className="text-xs text-foreground font-medium">
                  {order.items[0]?.description || "Custom Tailoring Order"}
                  {order.items.length > 1 && ` (+${order.items.length - 1} more item)`}
                </p>

                <div className="text-xs text-muted-foreground flex items-center gap-3 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Booked {formatDate(order.createdAt)}
                  </span>
                  {order.expectedDeliveryDate && (
                    <span>• Target Delivery: {formatDate(order.expectedDeliveryDate)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                <div className="text-right">
                  <div className="text-sm font-bold font-heading text-foreground">
                    {formatCurrency(Number(order.total))}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Advance: {formatCurrency(Number(order.advancePaid))} | Balance:{" "}
                    <span className={Number(order.balance) > 0 ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
                      {formatCurrency(Number(order.balance))}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "h-8 px-2 text-xs",
                  })}
                >
                  View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
