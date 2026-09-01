import Link from "next/link";
import { getOrders, getOrderStats } from "@/services/order.service";
import { OrderStatsCards } from "@/components/orders/order-stats-cards";
import { OrderFilterToolbar } from "@/components/orders/order-filter-toolbar";
import { OrderTable } from "@/components/orders/order-table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, ShoppingBag, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    paymentStatus?: string;
    customerId?: string;
    page?: string;
    pageSize?: string;
    sortBy?: "createdAt" | "expectedDeliveryDate" | "total";
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 20;

  const [data, stats] = await Promise.all([
    getOrders({
      search: params.search,
      status: params.status,
      priority: params.priority,
      paymentStatus: params.paymentStatus,
      customerId: params.customerId,
      page,
      pageSize,
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    }),
    getOrderStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Orders Management"
        subtitle="Track multi-item custom tailoring bookings, cutting, stitching, trials, and fulfillment."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/quotations"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Estimates &amp; Quotes
            </Link>

            <Link
              href="/orders/new"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground shadow-sm",
              })}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Book New Order
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <OrderStatsCards stats={stats} />

      {/* Filter Toolbar */}
      <OrderFilterToolbar />

      {/* Orders Table */}
      <OrderTable orders={data.orders} />

      {/* Pagination Controls */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, data.pagination.totalCount)} of{" "}
            {data.pagination.totalCount} orders
          </span>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link
                href={`/orders?page=${page - 1}${params.search ? `&search=${params.search}` : ""}`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs" })}
              >
                Previous
              </Link>
            )}
            <span className="px-3 py-1 font-semibold text-foreground">
              Page {page} of {data.pagination.totalPages}
            </span>
            {page < data.pagination.totalPages && (
              <Link
                href={`/orders?page=${page + 1}${params.search ? `&search=${params.search}` : ""}`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs" })}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
