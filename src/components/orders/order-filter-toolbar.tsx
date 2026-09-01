"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, Sparkles } from "lucide-react";

export function OrderFilterToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL" && value !== "") {
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
            placeholder="Search orders by Order #, client name, phone, item name, or notes..."
            defaultValue={searchParams.get("search") || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Status Dropdown */}
          <select
            value={searchParams.get("status") || "ALL"}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="MATERIAL_SOURCING">Material Sourcing</option>
            <option value="CUTTING">Cutting</option>
            <option value="STITCHING">Stitching</option>
            <option value="EMBROIDERY">Embroidery</option>
            <option value="QUALITY_CHECK">Quality Check</option>
            <option value="READY">Ready for Trial</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={searchParams.get("priority") || "ALL"}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="NORMAL">Normal Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT_RUSH">Rush / Express</option>
          </select>

          {/* Payment Status */}
          <select
            value={searchParams.get("paymentStatus") || "ALL"}
            onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Payment Status</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PAID">Fully Paid</option>
          </select>
        </div>
      </div>

      {isPending && (
        <div className="text-[11px] text-primary flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-3 h-3" />
          Filtering orders list...
        </div>
      )}
    </div>
  );
}
