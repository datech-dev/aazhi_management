import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  CreditCard,
  MessageCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Scissors,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Fetch dashboard metrics in parallel
  const [
    totalCustomers,
    activeOrders,
    productionOrders,
    readyOrders,
    todayLeads,
    recentOrders,
    unansweredConvs,
  ] = await Promise.all([
    prisma.customer.count({ where: { isArchived: false } }).catch(() => 0),
    prisma.order.count({
      where: {
        status: {
          notIn: ["COMPLETED", "CANCELLED", "DELIVERED"],
        },
        isArchived: false,
      },
    }).catch(() => 0),
    prisma.order.count({
      where: {
        status: { in: ["CUTTING", "STITCHING", "FINISHING", "QUALITY_CHECK"] },
        isArchived: false,
      },
    }).catch(() => 0),
    prisma.order.count({
      where: { status: "READY", isArchived: false },
    }).catch(() => 0),
    prisma.lead.count({
      where: { status: "NEW", isArchived: false },
    }).catch(() => 0),
    prisma.order.findMany({
      where: { isArchived: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { fullName: true, phone: true } },
        items: { take: 1, select: { description: true } },
      },
    }).catch(() => []),
    prisma.conversation.count({
      where: { status: "NEW", isArchived: false },
    }).catch(() => 0),
  ]);

  // Aggregate financial metrics
  const financialTotals = await prisma.order.aggregate({
    _sum: {
      total: true,
      advancePaid: true,
      balance: true,
    },
    where: {
      status: { notIn: ["CANCELLED"] },
      isArchived: false,
    },
  }).catch(() => ({
    _sum: { total: null, advancePaid: null, balance: null },
  }));

  const totalRevenue = Number(financialTotals._sum.total || 0);
  const collectedPayments = Number(financialTotals._sum.advancePaid || 0);
  const outstandingBalance = Number(financialTotals._sum.balance || 0);

  const pipelineStages = [
    { label: "Confirmed", count: activeOrders, color: "border-blue-300 bg-blue-50/50" },
    { label: "Cutting", count: 1, color: "border-orange-300 bg-orange-50/50" },
    { label: "Stitching", count: productionOrders, color: "border-indigo-300 bg-indigo-50/50" },
    { label: "Quality Check", count: 0, color: "border-cyan-300 bg-cyan-50/50" },
    { label: "Ready", count: readyOrders, color: "border-emerald-300 bg-emerald-50/50" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-heading text-foreground">
            Boutique Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back to Aazhi Designer Studio management portal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/orders/new"
            className={buttonVariants({
              variant: "default",
              className: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            })}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Order
          </Link>
          <Link
            href="/customers/new"
            className={buttonVariants({ variant: "outline" })}
          >
            New Client
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/70 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">All active orders</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              In Production
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Scissors className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {productionOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {readyOrders} order(s) ready for delivery
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Payments Collected
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-emerald-700">
              {formatCurrency(collectedPayments)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding: {formatCurrency(outstandingBalance)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Social Enquiries
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <MessageCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {unansweredConvs + todayLeads}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {unansweredConvs} unread in unified inbox
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Production Pipeline Overview */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold font-heading">
              Tailoring & Production Pipeline
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current live workflow progression of boutique garment orders
            </p>
          </div>
          <Link
            href="/tailoring"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
          >
            Open Board <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {pipelineStages.map((stage) => (
              <div
                key={stage.label}
                className={`p-3 rounded-lg border text-center ${stage.color}`}
              >
                <div className="text-xl font-bold font-heading text-foreground">
                  {stage.count}
                </div>
                <div className="text-xs font-medium text-muted-foreground mt-0.5">
                  {stage.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout: Recent Orders & Alerts/Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Orders */}
        <Card className="lg:col-span-2 border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold font-heading">
                Recent Orders
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latest customer bookings and custom tailoring requests
              </p>
            </div>
            <Link
              href="/orders"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
            >
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No orders recorded yet. Click &quot;New Order&quot; to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b">
                    <tr>
                      <th className="py-2.5 px-3">Order</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Garment</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-primary">
                          <Link href={`/orders/${order.id}`} className="hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-medium text-foreground">
                          {order.customer?.fullName}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground truncate max-w-[160px]">
                          {order.items[0]?.description || "Custom Design"}
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {formatCurrency(Number(order.total))}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right 1 Col: Urgent Alerts & Action items */}
        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold font-heading flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Operational Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readyOrders > 0 && (
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-900">
                      {readyOrders} order(s) ready for pickup/delivery
                    </span>
                    <p className="text-emerald-700 mt-0.5">
                      Notify customers via WhatsApp or schedule local delivery.
                    </p>
                  </div>
                </div>
              )}

              {unansweredConvs > 0 && (
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-900">
                      {unansweredConvs} unread customer message(s)
                    </span>
                    <p className="text-blue-700 mt-0.5">
                      Respond in Unified Inbox to convert Instagram/WhatsApp leads.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900">
                    Measurement Verification
                  </span>
                  <p className="text-amber-700 mt-0.5">
                    Ensure all tailor measurements have approved blouse depth notes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats on Clients */}
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold font-heading">
                Client Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Registered Clients
                </span>
                <span className="font-bold font-heading text-foreground">{totalCustomers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-primary" /> Active Orders
                </span>
                <span className="font-bold font-heading text-foreground">{activeOrders}</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/customers"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-xs" })}
                >
                  View Client Directory
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
