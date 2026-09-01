import Link from "next/link";
import {
  getProducts,
  getProductStats,
  getProductCategories,
} from "@/services/product.service";
import { ProductStatsCards } from "@/components/products/product-stats-cards";
import { ProductFilterToolbar } from "@/components/products/product-filter-toolbar";
import { ProductGrid } from "@/components/products/product-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    collection?: string;
    fabric?: string;
    isCustomizable?: "true" | "false";
    stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
    page?: string;
    pageSize?: string;
    sortBy?: "name" | "price" | "availableQuantity" | "createdAt";
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 20;

  const [data, stats, categories] = await Promise.all([
    getProducts({
      search: params.search,
      categoryId: params.categoryId,
      collection: params.collection,
      fabric: params.fabric,
      isCustomizable: params.isCustomizable,
      stockStatus: params.stockStatus || "all",
      page,
      pageSize,
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    }),
    getProductStats(),
    getProductCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Product & Design Catalog"
        subtitle="Manage bespoke garment designs, bridal collections, ready-to-wear inventory, and pricing."
        actions={
          <Link
            href="/products/new"
            className={buttonVariants({
              variant: "default",
              className: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            })}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Design
          </Link>
        }
      />

      {/* KPI Stats */}
      <ProductStatsCards stats={stats} />

      {/* Filters Toolbar */}
      <ProductFilterToolbar categories={categories} />

      {/* Product Grid */}
      <ProductGrid products={data.products} />

      {/* Pagination Controls */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, data.pagination.totalCount)} of{" "}
            {data.pagination.totalCount} designs
          </span>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link
                href={`/products?page=${page - 1}${params.search ? `&search=${params.search}` : ""}`}
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
                href={`/products?page=${page + 1}${params.search ? `&search=${params.search}` : ""}`}
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
