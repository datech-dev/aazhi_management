"use client";

import { useState } from "react";
import { createLeadAction } from "@/actions/lead.actions";
import { toast } from "sonner";
import { X, Target, User, IndianRupee, Calendar } from "lucide-react";
import { CustomerSource, Priority } from "@prisma/client";

interface CustomerOption {
  id: string;
  fullName: string;
  phone: string | null;
}

interface LeadCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerOption[];
}

export function LeadCreateModal({ isOpen, onClose, customers }: LeadCreateModalProps) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [source, setSource] = useState<CustomerSource>(CustomerSource.WHATSAPP);
  const [estimatedValue, setEstimatedValue] = useState<number | "">("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error("Please select a customer profile");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createLeadAction({
        customerId,
        source,
        estimatedValue: typeof estimatedValue === "number" ? estimatedValue : undefined,
        priority,
        enquiryMessage,
        notes,
      });

      if (res.success) {
        toast.success(`Inquiry Lead ${res.lead?.leadNumber} created successfully!`);
        onClose();
      } else {
        toast.error(res.error || "Failed to create lead");
      }
    } catch {
      toast.error("An error occurred while creating lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background text-foreground w-full max-w-md rounded-xl border border-border shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-base font-bold font-heading">New Inquiry Lead</h2>
            <p className="text-xs text-muted-foreground">Record social or walk-in client inquiry</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Customer Selector */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Customer Profile
            </label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Source & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Inquiry Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as CustomerSource)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="WALK_IN">Walk-In Studio</option>
                <option value="REFERRAL">Referral</option>
                <option value="PHONE">Phone Call</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Estimated Value */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Estimated Order Value (₹)
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                placeholder="e.g. 15000"
                value={estimatedValue}
                onChange={(e) =>
                  setEstimatedValue(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background"
              />
            </div>
          </div>

          {/* Enquiry Message */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Enquiry Details / Garment Requirement
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Inquired about bridal designer blouse with heavy zardozi embroidery for reception..."
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Save Inquiry Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
