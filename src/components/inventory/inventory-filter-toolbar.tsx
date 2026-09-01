"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, Sparkles } from "lucide-react";

export function InventoryFilterToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search materials by name, SKU, or storage location (e.g. Rack A-1)..."
            defaultValue={searchParams.get("search") || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Item Type Dropdown */}
          <select
            value={searchParams.get("type") || "all"}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Material Types</option>
            <option value="FABRIC">Fabric (Silk, Organza)</option>
            <option value="LINING">Lining Cloth</option>
            <option value="LACE">Laces & Borders</option>
            <option value="EMBELLISHMENT">Embellishments / Beads</option>
            <option value="ZIPPERS">Zippers</option>
            <option value="HOOKS">Hooks & Eyes</option>
            <option value="THREADS">Embroidery Threads</option>
            <option value="BUTTONS">Buttons</option>
            <option value="PRODUCT">Finished Products</option>
            <option value="OTHER">Other Materials</option>
          </select>

          {/* Stock Status Dropdown */}
          <select
            value={searchParams.get("stockStatus") || "all"}
            onChange={(e) => handleFilterChange("stockStatus", e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="in_stock">In Stock (&gt;0)</option>
            <option value="low_stock">Low Stock (≤ Reorder)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {/* Sort Order */}
          <select
            value={searchParams.get("sortBy") || "name"}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="name">Name (A-Z)</option>
            <option value="quantity">Stock Quantity</option>
            <option value="sku">SKU Code</option>
            <option value="createdAt">Date Added</option>
          </select>
        </div>
      </div>

      {isPending && (
        <div className="text-[11px] text-primary flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-3 h-3" />
          Filtering inventory ledger...
        </div>
      )}
    </div>
  );
}
