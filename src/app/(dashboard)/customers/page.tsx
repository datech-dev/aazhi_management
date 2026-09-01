import Link from "next/link";
import { getCustomers, getCustomerStats } from "@/services/customer.service";
import { CustomerStatsCards } from "@/components/customers/customer-stats-cards";
import { CustomerFilterToolbar } from "@/components/customers/customer-filter-toolbar";
import { CustomerListTable } from "@/components/customers/customer-list-table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    source?: "INSTAGRAM" | "WHATSAPP" | "WALK_IN" | "REFERRAL" | "PHONE" | "WEBSITE" | "OTHER";
    tag?: string;
    page?: string;
    pageSize?: string;
    sortBy?: "fullName" | "createdAt" | "totalOrders" | "totalLifetimeValue" | "lastInteractionAt";
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 20;

  const [data, stats] = await Promise.all([
    getCustomers({
      search: params.search,
      source: params.source,
      tag: params.tag,
      page,
      pageSize,
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    }),
    getCustomerStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Client Directory"
        subtitle="Manage your boutique customer base, bridal clients, social leads, and measurement histories."
        actions={
          <Link
            href="/customers/new"
            className={buttonVariants({
              variant: "default",
              className: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            })}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Client
          </Link>
        }
      />

      {/* KPI Stats */}
      <CustomerStatsCards stats={stats} />

      {/* Filters & Search */}
      <CustomerFilterToolbar />

      {/* Main Table */}
      <CustomerListTable customers={data.customers} />

      {/* Pagination Controls */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, data.pagination.totalCount)} of{" "}
            {data.pagination.totalCount} clients
          </span>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link
                href={`/customers?page=${page - 1}${params.search ? `&search=${params.search}` : ""}`}
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
                href={`/customers?page=${page + 1}${params.search ? `&search=${params.search}` : ""}`}
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
