import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "lead" | "priority" | "delivery" | "production";
  className?: string;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  // Order statuses
  DRAFT: "bg-stone-100 text-stone-700 border-stone-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  MEASUREMENT_PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CUTTING: "bg-orange-50 text-orange-700 border-orange-200",
  STITCHING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  FINISHING: "bg-purple-50 text-purple-700 border-purple-200",
  QUALITY_CHECK: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ALTERATION: "bg-rose-50 text-rose-700 border-rose-200",
  READY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DELIVERED: "bg-teal-50 text-teal-700 border-teal-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",

  // Payment statuses
  UNPAID: "bg-red-50 text-red-700 border-red-200",
  ADVANCE_PAID: "bg-amber-50 text-amber-700 border-amber-200",
  PARTIALLY_PAID: "bg-orange-50 text-orange-700 border-orange-200",
  FULLY_PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REFUNDED: "bg-gray-100 text-gray-700 border-gray-200",

  // Priorities
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-red-50 text-red-700 border-red-200 font-semibold",

  // Leads
  NEW: "bg-sky-50 text-sky-700 border-sky-200",
  CONTACTED: "bg-cyan-50 text-cyan-700 border-cyan-200",
  INTERESTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  QUOTE_SENT: "bg-amber-50 text-amber-700 border-amber-200",
  NEGOTIATION: "bg-purple-50 text-purple-700 border-purple-200",
  LOST: "bg-zinc-100 text-zinc-600 border-zinc-200",
  CONVERTED: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const formattedLabel = status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const colorClass =
    STATUS_COLOR_MAP[status] || "bg-muted text-muted-foreground border-border";

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 font-medium tracking-wide text-[11px]", colorClass, className)}
    >
      {formattedLabel}
    </Badge>
  );
}
