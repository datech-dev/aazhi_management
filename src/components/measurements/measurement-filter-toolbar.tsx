"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, Sparkles } from "lucide-react";

interface TemplateOption {
  id: string;
  name: string;
}

interface MeasurementFilterToolbarProps {
  templates: TemplateOption[];
}

export function MeasurementFilterToolbar({ templates }: MeasurementFilterToolbarProps) {
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
            placeholder="Search measurements by client name, phone number, or tailor cutting notes..."
            defaultValue={searchParams.get("search") || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Template Dropdown */}
          <select
            value={searchParams.get("templateId") || "all"}
            onChange={(e) => handleFilterChange("templateId", e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Garment Types</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Sort Order */}
          <select
            value={searchParams.get("sortBy") || "createdAt"}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="createdAt">Latest Recorded</option>
            <option value="version">Revision Number</option>
          </select>
        </div>
      </div>

      {isPending && (
        <div className="text-[11px] text-primary flex items-center gap-1.5 animate-pulse">
          <Sparkles className="w-3 h-3" />
          Filtering measurement profiles...
        </div>
      )}
    </div>
  );
}
