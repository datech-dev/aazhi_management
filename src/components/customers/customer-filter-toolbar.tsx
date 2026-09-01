"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface FilterToolbarProps {
  availableTags?: string[];
}

export function CustomerFilterToolbar({
  availableTags = ["Bridal", "VIP", "Repeat", "Urgent", "Blouse Specialist"],
}: FilterToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const currentSource = searchParams.get("source") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentSort = searchParams.get("sortBy") || "createdAt";
  const currentOrder = searchParams.get("sortOrder") || "desc";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset pagination

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", searchTerm);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(
    searchParams.get("search") ||
    searchParams.get("source") ||
    searchParams.get("tag") ||
    searchParams.get("sortBy")
  );

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, email, Instagram..."
            className="w-full pl-9 pr-20 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={currentSource}
              onChange={(e) => updateFilters("source", e.target.value)}
              className="text-xs py-2 px-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter by source channel"
            >
              <option value="ALL">All Channels</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="REFERRAL">Referral</option>
              <option value="PHONE">Phone</option>
            </select>
          </div>

          {/* Tag Filter */}
          <select
            value={currentTag}
            onChange={(e) => updateFilters("tag", e.target.value)}
            className="text-xs py-2 px-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by customer tag"
          >
            <option value="ALL">All Tags</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={`${currentSort}-${currentOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                const params = new URLSearchParams(searchParams.toString());
                params.set("sortBy", sb);
                params.set("sortOrder", so);
                startTransition(() => {
                  router.push(`${pathname}?${params.toString()}`);
                });
              }}
              className="text-xs py-2 px-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Sort customer list"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="fullName-asc">Name (A-Z)</option>
              <option value="totalOrders-desc">Most Orders</option>
              <option value="totalLifetimeValue-desc">Highest Spend</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-xs text-muted-foreground hover:text-foreground h-8 px-2",
              })}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
