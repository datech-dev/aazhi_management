"use client";

import { useState } from "react";
import Link from "next/link";
import { KanbanOrder } from "@/services/production.service";
import { OrderStatus } from "@prisma/client";
import { assignTailorAction, moveKanbanStageAction } from "@/actions/production.actions";
import { formatDate } from "@/lib/utils";
import {
  Clock,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Printer,
} from "lucide-react";

interface TailorOption {
  id: string;
  name: string;
  role: string;
}

interface ProductionOrderCardProps {
  order: KanbanOrder;
  tailors: TailorOption[];
  stageColumns: { id: OrderStatus; title: string }[];
  currentColumnIndex: number;
}

export function ProductionOrderCard({
  order,
  tailors,
  stageColumns,
  currentColumnIndex,
}: ProductionOrderCardProps) {
  const [loading, setLoading] = useState(false);
  const [assignedTailorId, setAssignedTailorId] = useState(order.assignedTailor?.id || "");

  const prevStage = currentColumnIndex > 0 ? stageColumns[currentColumnIndex - 1] : null;
  const nextStage =
    currentColumnIndex < stageColumns.length - 1 ? stageColumns[currentColumnIndex + 1] : null;

  const handleStageMove = async (newStatus: OrderStatus) => {
    setLoading(true);
    try {
      await moveKanbanStageAction(order.id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTailorAssign = async (tailorId: string) => {
    setLoading(true);
    setAssignedTailorId(tailorId);
    try {
      await assignTailorAction(order.id, tailorId || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgency = (date: Date | null) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return (
        <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <AlertTriangle className="w-2.5 h-2.5" /> Overdue {Math.abs(diff)}d
        </span>
      );
    }
    if (diff === 0) {
      return (
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" /> Due Today
        </span>
      );
    }
    if (diff <= 2) {
      return (
        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
          Due in {diff}d
        </span>
      );
    }
    return (
      <span className="text-[10px] text-muted-foreground">
        Due {formatDate(date)}
      </span>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border p-3.5 shadow-sm hover:shadow transition-all space-y-2.5 group relative">
      {/* Top Header: Order Number & Priority */}
      <div className="flex items-start justify-between gap-1">
        <Link
          href={`/orders/${order.id}`}
          className="font-bold text-xs text-primary hover:underline font-heading flex items-center gap-1"
        >
          {order.orderNumber}
          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
        </Link>

        <div className="flex items-center gap-1">
          {order.priority === "URGENT" && (
            <span className="text-[9px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.2 rounded uppercase">
              Rush
            </span>
          )}
          {order.priority === "HIGH" && (
            <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded uppercase">
              High
            </span>
          )}
        </div>
      </div>

      {/* Customer Name */}
      <div>
        <span className="text-xs font-bold text-foreground block truncate">
          {order.customer.fullName}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {order.customer.phone || order.customer.whatsappNumber || "Walk-in"}
        </span>
      </div>

      {/* Garments Summary */}
      <div className="space-y-1 bg-muted/20 p-2 rounded-lg border border-border/50 text-[11px]">
        {order.items.map((item) => (
          <div key={item.id} className="leading-snug">
            <span className="font-semibold text-foreground">
              {item.quantity}x {item.description}
            </span>
            {item.customizations && (
              <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
                {item.customizations}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Delivery Urgency */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-muted-foreground">Deadline:</span>
        {getUrgency(order.expectedDeliveryDate)}
      </div>

      {/* Tailor Assignment Dropdown */}
      <div className="pt-1 border-t border-border/60">
        <div className="flex items-center justify-between gap-1">
          <label className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
            <UserCheck className="w-3 h-3 text-primary" /> Tailor:
          </label>
          <select
            disabled={loading}
            value={assignedTailorId}
            onChange={(e) => handleTailorAssign(e.target.value)}
            className="text-[10px] bg-muted/40 border border-border rounded px-1.5 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[130px] truncate"
          >
            <option value="">Unassigned</option>
            {tailors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stage Progression Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-border/60 gap-1">
        {prevStage ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleStageMove(prevStage.id)}
            title={`Move back to ${prevStage.title}`}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] flex items-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-4" />
        )}

        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        ) : (
          <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
            {order.status.replace(/_/g, " ")}
          </span>
        )}

        {nextStage ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleStageMove(nextStage.id)}
            title={`Advance to ${nextStage.title}`}
            className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold text-[10px] flex items-center gap-0.5 transition-colors"
          >
            Next <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <div className="w-4" />
        )}
      </div>
    </div>
  );
}
