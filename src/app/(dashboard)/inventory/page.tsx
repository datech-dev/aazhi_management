import Link from "next/link";
import {
  getInventoryItems,
  getInventoryStats,
} from "@/services/inventory.service";
import { InventoryStatsCards } from "@/components/inventory/inventory-stats-cards";
import { InventoryFilterToolbar } from "@/components/inventory/inventory-filter-toolbar";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface InventoryPageProps {
  searchParams: Promise<{
    search?: string;
    type?:
      | "PRODUCT"
      | "FABRIC"
      | "LINING"
      | "LACE"
      | "BUTTONS"
      | "ZIPPERS"
      | "HOOKS"
      | "THREADS"
      | "EMBELLISHMENT"
      | "OTHER";
    stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
    page?: string;
    pageSize?: string;
    sortBy?: "name" | "sku" | "quantity" | "createdAt";
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 20;

  const [data, stats] = await Promise.all([
    getInventoryItems({
      search: params.search,
      type: params.type,
      stockStatus: params.stockStatus || "all",
      page,
      pageSize,
      sortBy: params.sortBy || "name",
      sortOrder: params.sortOrder || "asc",
    }),
    getInventoryStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Raw Material & Fabric Inventory"
        subtitle="Track boutique fabrics (in meters), lining cloths, embroidery laces, zippers, and tailoring supplies."
        actions={
          <Link
            href="/inventory/new"
            className={buttonVariants({
              variant: "default",
              className: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            })}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Material
          </Link>
        }
      />

      {/* KPI Stats */}
      <InventoryStatsCards stats={stats} />

      {/* Filter Toolbar */}
      <InventoryFilterToolbar />

      {/* Inventory Table */}
      <InventoryTable items={data.items} />

      {/* Pagination Controls */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, data.pagination.totalCount)} of{" "}
            {data.pagination.totalCount} material items
          </span>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link
                href={`/inventory?page=${page - 1}${params.search ? `&search=${params.search}` : ""}`}
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
                href={`/inventory?page=${page + 1}${params.search ? `&search=${params.search}` : ""}`}
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
