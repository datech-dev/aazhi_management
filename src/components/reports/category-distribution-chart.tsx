"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryDistributionProps {
  data: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
}

const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#64748b"];

export function CategoryDistributionChart({ data }: CategoryDistributionProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card text-card-foreground p-6 rounded-xl border border-border/60 shadow-sm flex items-center justify-center h-72 text-xs text-muted-foreground">
        No category distribution data available.
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border/60 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold font-heading text-foreground">
            Sales by Garment Category
          </h3>
          <p className="text-xs text-muted-foreground">Revenue share breakdown</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="revenue"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "#334155",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={10}
              wrapperStyle={{ fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
