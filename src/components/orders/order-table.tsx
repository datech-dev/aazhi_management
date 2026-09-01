import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatus, Priority, PaymentStatus } from "@prisma/client";
import { ShoppingBag, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface OrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  priority: Priority;
  paymentStatus: PaymentStatus;
  total: unknown;
  advancePaid: unknown;
  expectedDeliveryDate?: Date | null;
  createdAt: Date;
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
    whatsappNumber: string | null;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
  }[];
  salesperson?: {
    name: string;
  } | null;
}

interface OrderTableProps {
  orders: OrderRow[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "MEASUREMENT_PENDING":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "CUTTING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "STITCHING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "FINISHING":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "QUALITY_CHECK":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "READY":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-destructive/10 text-destructive border-destructive/20 font-bold";
      case "HIGH":
        return "bg-amber-50 text-amber-600 border-amber-200 font-semibold";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "FULLY_PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARTIALLY_PAID":
      case "ADVANCE_PAID":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "UNPAID":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getDeliveryUrgency = (date?: Date | null) => {
    if (!date) return null;
    const target = new Date(date).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-[11px] font-bold text-destructive flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Overdue by {Math.abs(diffDays)}d
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Due Today
        </span>
      );
    }
    if (diffDays <= 3) {
      return (
        <span className="text-[11px] font-semibold text-amber-600">
          Due in {diffDays} days
        </span>
      );
    }
    return (
      <span className="text-[11px] text-muted-foreground">
        Due {formatDate(date)}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold font-heading text-foreground">
          No orders found
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Start a new multi-item booking or custom tailoring order using the booking wizard.
        </p>
        <div className="mt-4">
          <Link
            href="/orders/new"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-primary text-primary-foreground",
            })}
          >
            Book New Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-4">Order Details</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items / Garments</th>
              <th className="p-4">Lifecycle Stage</th>
              <th className="p-4">Delivery Due</th>
              <th className="p-4">Financials</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                {/* Order Details */}
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-bold text-sm text-primary hover:underline font-heading"
                    >
                      {order.orderNumber}
                    </Link>
                    {order.priority !== "MEDIUM" && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${getPriorityBadge(
                          order.priority
                        )}`}
                      >
                        {order.priority}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Booked {formatDate(order.createdAt)}
                  </div>
                </td>

                {/* Customer */}
                <td className="p-4">
                  <Link
                    href={`/customers/${order.customer.id}`}
                    className="font-bold text-foreground hover:text-primary transition-colors block"
                  >
                    {order.customer.fullName}
                  </Link>
                  <span className="text-muted-foreground text-[11px] font-mono">
                    {order.customer.phone || order.customer.whatsappNumber || "No contact"}
                  </span>
                </td>

                {/* Items */}
                <td className="p-4">
                  <div className="font-medium text-foreground">
                    {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
                  </div>
                  <div
                    className="text-[11px] text-muted-foreground truncate max-w-[180px]"
                    title={order.items.map((i) => i.description).join(", ")}
                  >
                    {order.items.map((i) => i.description).join(", ")}
                  </div>
                </td>

                {/* Lifecycle Stage */}
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </td>

                {/* Delivery Due */}
                <td className="p-4">{getDeliveryUrgency(order.expectedDeliveryDate)}</td>

                {/* Financials */}
                <td className="p-4">
                  <div className="font-bold text-foreground text-sm font-heading">
                    {formatCurrency(Number(order.total))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getPaymentBadge(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Paid: {formatCurrency(Number(order.advancePaid))}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <Link
                    href={`/orders/${order.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-8 px-2.5 text-xs font-semibold text-foreground hover:text-primary",
                    })}
                  >
                    View Order <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
