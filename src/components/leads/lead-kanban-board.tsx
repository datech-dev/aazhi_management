"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Target,
  User,
  Calendar,
  Phone,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";
import { updateLeadStatusAction } from "@/actions/lead.actions";
import { toast } from "sonner";
import { LeadStatus } from "@prisma/client";

interface LeadItem {
  id: string;
  leadNumber: string;
  source: string;
  enquiryMessage: string | null;
  estimatedValue: number | any;
  status: LeadStatus;
  priority: string;
  followUpDate: Date | string | null;
  createdAt: Date | string;
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
  };
  assignedStaff: {
    id: string;
    name: string;
  } | null;
  interestedProduct: {
    id: string;
    name: string;
    price: number | any;
  } | null;
}

interface LeadKanbanBoardProps {
  leads: LeadItem[];
  onOpenCreateModal?: () => void;
}

const STAGES: Array<{ id: LeadStatus; label: string; color: string }> = [
  { id: "NEW", label: "New Inquiry", color: "bg-blue-500" },
  { id: "CONTACTED", label: "Contacted", color: "bg-indigo-500" },
  { id: "INTERESTED", label: "Interested", color: "bg-purple-500" },
  { id: "QUOTE_SENT", label: "Quote Sent", color: "bg-amber-500" },
  { id: "NEGOTIATION", label: "Negotiation", color: "bg-orange-500" },
  { id: "CONFIRMED", label: "Confirmed", color: "bg-emerald-500" },
];

export function LeadKanbanBoard({ leads, onOpenCreateModal }: LeadKanbanBoardProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      const res = await updateLeadStatusAction(leadId, newStatus);
      if (res.success) {
        toast.success(`Lead moved to ${newStatus}`);
      } else {
        toast.error(res.error || "Failed to update lead stage");
      }
    } catch {
      toast.error("Error updating lead stage");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.id);
          const stageTotalValue = stageLeads.reduce(
            (sum, l) => sum + (l.estimatedValue ? Number(l.estimatedValue) : 0),
            0
          );

          return (
            <div
              key={stage.id}
              className="bg-card text-card-foreground rounded-xl border border-border/60 p-3 flex flex-col h-[calc(100vh-220px)] min-w-[240px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                  <h3 className="text-xs font-bold font-heading text-foreground">
                    {stage.label}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground font-semibold">
                    {stageLeads.length}
                  </span>
                </div>
                {stageTotalValue > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(stageTotalValue)}
                  </span>
                )}
              </div>

              {/* Lead Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-muted-foreground border border-dashed border-border/60 rounded-lg">
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-background p-3 rounded-lg border border-border/70 shadow-xs hover:border-primary/40 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-primary">
                          {lead.leadNumber}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {lead.source}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {lead.customer.fullName}
                        </h4>
                        {lead.customer.phone && (
                          <p className="text-[11px] text-muted-foreground">
                            {lead.customer.phone}
                          </p>
                        )}
                      </div>

                      {lead.enquiryMessage && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/30 p-1.5 rounded italic">
                          "{lead.enquiryMessage}"
                        </p>
                      )}

                      {lead.estimatedValue && (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                          <span className="text-muted-foreground text-[10px]">Est. Value:</span>
                          <span className="font-bold text-foreground">
                            {formatCurrency(Number(lead.estimatedValue))}
                          </span>
                        </div>
                      )}

                      {/* Quick Move Buttons */}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-1">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusUpdate(lead.id, e.target.value as LeadStatus)
                          }
                          disabled={updatingId === lead.id}
                          className="w-full text-[10px] py-1 px-1.5 rounded border border-border bg-muted/40 text-foreground"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move to: {s.label}
                            </option>
                          ))}
                          <option value="CONVERTED">Convert Lead</option>
                          <option value="LOST">Mark Lost</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
