"use client";

import { useState } from "react";
import { KanbanColumn } from "@/services/production.service";
import { ProductionOrderCard } from "./production-order-card";
import {
  Search,
  Filter,
  Users,
  Flame,
  Clock,
  Layers,
} from "lucide-react";

interface TailorOption {
  id: string;
  name: string;
  role: string;
}

interface ProductionKanbanBoardProps {
  initialColumns: KanbanColumn[];
  tailors: TailorOption[];
}

export function ProductionKanbanBoard({
  initialColumns,
  tailors,
}: ProductionKanbanBoardProps) {
  const [search, setSearch] = useState("");
  const [selectedTailorId, setSelectedTailorId] = useState("ALL");
  const [onlyRush, setOnlyRush] = useState(false);

  const stageColumns = initialColumns.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  // Filter orders in each column
  const filteredColumns = initialColumns.map((col) => {
    const orders = col.orders.filter((order) => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(query);
        const matchesCust = order.customer.fullName.toLowerCase().includes(query);
        const matchesItems = order.items.some((i) =>
          i.description.toLowerCase().includes(query)
        );
        if (!matchesNumber && !matchesCust && !matchesItems) return false;
      }

      // 2. Tailor Filter
      if (selectedTailorId !== "ALL") {
        if (selectedTailorId === "UNASSIGNED") {
          if (order.assignedTailor) return false;
        } else {
          if (order.assignedTailor?.id !== selectedTailorId) return false;
        }
      }

      // 3. Rush Filter
      if (onlyRush) {
        if (order.priority !== "URGENT" && order.priority !== "HIGH") return false;
      }

      return true;
    });

    return {
      ...col,
      orders,
    };
  });

  const totalDisplayedOrders = filteredColumns.reduce(
    (acc, col) => acc + col.orders.length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Control & Filter Toolbar */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, or garment..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted/40 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tailor Selector */}
          <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-lg px-2.5 py-1">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedTailorId}
              onChange={(e) => setSelectedTailorId(e.target.value)}
              className="bg-transparent text-xs text-foreground focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Tailors</option>
              <option value="UNASSIGNED">Unassigned Orders</option>
              {tailors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rush Orders Toggle */}
          <button
            type="button"
            onClick={() => setOnlyRush(!onlyRush)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              onlyRush
                ? "bg-destructive text-destructive-foreground border-destructive shadow-sm"
                : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Rush Orders Only
          </button>

          <span className="text-xs text-muted-foreground ml-1">
            {totalDisplayedOrders} Orders in Workshop
          </span>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-6 gap-4 min-w-[1300px]">
          {filteredColumns.map((col, colIdx) => (
            <div
              key={col.id}
              className="bg-muted/30 rounded-xl border border-border p-3 flex flex-col max-h-[calc(100vh-220px)] shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      col.color === "indigo"
                        ? "bg-indigo-500"
                        : col.color === "amber"
                        ? "bg-amber-500"
                        : col.color === "orange"
                        ? "bg-orange-500"
                        : col.color === "purple"
                        ? "bg-purple-500"
                        : col.color === "cyan"
                        ? "bg-cyan-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <h4 className="font-bold text-xs font-heading text-foreground truncate">
                    {col.title}
                  </h4>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-card border border-border text-foreground">
                  {col.orders.length}
                </span>
              </div>

              {/* Order Cards Stack */}
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                {col.orders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <Layers className="w-5 h-5 mx-auto mb-1 opacity-30" />
                    No orders in this stage
                  </div>
                ) : (
                  col.orders.map((order) => (
                    <ProductionOrderCard
                      key={order.id}
                      order={order}
                      tailors={tailors}
                      stageColumns={stageColumns}
                      currentColumnIndex={colIdx}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
