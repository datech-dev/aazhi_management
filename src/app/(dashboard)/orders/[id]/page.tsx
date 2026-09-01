import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/services/order.service";
import { OrderLifecycleStepper } from "@/components/orders/order-lifecycle-stepper";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Scissors,
  CreditCard,
  User,
  Calendar,
  Printer,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const balanceDue = Math.max(0, Number(order.total) - Number(order.advancePaid));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title={`Order #${order.orderNumber}`}
        subtitle={`Booked on ${formatDate(order.createdAt)} ${
          order.salesperson ? `by ${order.salesperson.name}` : ""
        }`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/customers/${order.customer.id}`}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <User className="w-3.5 h-3.5 mr-1.5" />
              Customer 360
            </Link>

            <Link
              href="/orders"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              ← Back to Orders
            </Link>
          </div>
        }
      />

      {/* Production Stepper */}
      <OrderLifecycleStepper orderId={order.id} currentStatus={order.status} />

      {/* Top Grid: Client Card & Delivery Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Client Details
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Full Name
              </span>
              <span className="text-sm font-bold text-foreground font-heading">
                {order.customer.fullName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Phone
                </span>
                <span className="font-mono text-foreground font-semibold">
                  {order.customer.phone || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  WhatsApp
                </span>
                <span className="font-mono text-foreground font-semibold">
                  {order.customer.whatsappNumber || "N/A"}
                </span>
              </div>
            </div>

            {order.customer.addresses?.[0] && (
              <div className="pt-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Delivery Address
                </span>
                <p className="text-muted-foreground">
                  {order.customer.addresses[0].line1}, {order.customer.addresses[0].city},{" "}
                  {order.customer.addresses[0].pincode}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Fulfillment */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Schedule &amp; Fulfillment
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Priority Level</span>
              <span className="font-bold uppercase text-foreground">
                {order.priority}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Order Date</span>
              <span className="font-semibold text-foreground">
                {formatDate(order.orderDate)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Target Delivery Date</span>
              <span className="font-bold text-primary">
                {order.expectedDeliveryDate
                  ? formatDate(order.expectedDeliveryDate)
                  : "Standard Turnaround"}
              </span>
            </div>

            {order.assignedTailor && (
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Assigned Tailor</span>
                <span className="font-bold text-foreground">{order.assignedTailor.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Financial Status
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Payment Status</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                  order.paymentStatus === "FULLY_PAID"
                    ? "bg-emerald-50 text-emerald-700"
                    : order.paymentStatus === "PARTIALLY_PAID" || order.paymentStatus === "ADVANCE_PAID"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {order.paymentStatus.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Total Order Amount</span>
              <span className="font-bold text-foreground text-sm font-heading">
                {formatCurrency(Number(order.total))}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-muted-foreground">Advance Received</span>
              <span className="font-semibold text-emerald-600">
                {formatCurrency(Number(order.advancePaid))}
              </span>
            </div>

            <div className="flex justify-between py-1.5 font-bold text-sm">
              <span className="text-destructive">Balance Due</span>
              <span className="text-destructive font-mono">{formatCurrency(balanceDue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
          <Scissors className="w-4 h-4 text-primary" />
          Ordered Garments &amp; Custom Specifications ({order.items.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3">Item / Garment</th>
                <th className="p-3">Customization Specs</th>
                <th className="p-3">Cutting Profile</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/25">
                  <td className="p-3">
                    <span className="font-bold text-foreground block text-sm">
                      {item.description}
                    </span>
                    <span className="text-muted-foreground text-[11px]">Qty: {item.quantity}</span>
                  </td>

                  <td className="p-3 max-w-xs">
                    <p className="text-foreground leading-relaxed">
                      {item.customizations || item.notes || "Standard tailor cut"}
                    </p>
                  </td>

                  <td className="p-3">
                    {order.measurementProfile ? (
                      <Link
                        href={`/measurements/${order.measurementProfile.id}/print`}
                        target="_blank"
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cutting Sheet
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Standard size / Walk-in</span>
                    )}
                  </td>

                  <td className="p-3 text-right font-medium text-muted-foreground">
                    {formatCurrency(Number(item.unitPrice))}
                  </td>

                  <td className="p-3 text-right font-bold text-foreground text-sm font-heading">
                    {formatCurrency(Number(item.totalPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Ledger History */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base font-heading text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Payment History Ledger ({order.payments.length})
          </h3>
        </div>

        {order.payments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Reference / Notes</th>
                  <th className="p-3">Recorded By</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/25">
                    <td className="p-3 font-mono font-bold text-foreground">
                      {p.paymentNumber}
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-muted text-foreground font-semibold text-[10px]">
                        {p.method}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {p.referenceNumber ? `Ref: ${p.referenceNumber} • ` : ""}
                      {p.notes || "Standard payment"}
                    </td>
                    <td className="p-3 text-muted-foreground">{p.recordedBy?.name || "Staff"}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 text-sm font-heading">
                      {formatCurrency(Number(p.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
