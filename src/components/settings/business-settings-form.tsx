"use client";

import { useState } from "react";
import { updateBusinessSettingsAction } from "@/actions/settings.actions";
import { toast } from "sonner";
import { Settings, Save, Building, Hash, Percent, Mail, Phone } from "lucide-react";

interface BusinessSettingsFormProps {
  initialSettings: Record<string, string>;
}

export function BusinessSettingsForm({ initialSettings }: BusinessSettingsFormProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateBusinessSettingsAction(settings);
      if (res.success) {
        toast.success("Studio settings updated successfully!");
      } else {
        toast.error(res.error || "Failed to update business settings");
      }
    } catch {
      toast.error("Error saving business settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card text-card-foreground p-6 rounded-xl border border-border/60 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Studio Branding & General Configuration
          </h2>
          <p className="text-xs text-muted-foreground">
            Boutique name, contact info, GSTIN, and tax defaults used on printable receipts & invoices.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Studio Brand Name
          </label>
          <input
            type="text"
            value={settings.studio_name || ""}
            onChange={(e) => handleChange("studio_name", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Tagline / Sub-header
          </label>
          <input
            type="text"
            value={settings.studio_tagline || ""}
            onChange={(e) => handleChange("studio_tagline", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>

        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Studio Contact Phone
          </label>
          <input
            type="text"
            value={settings.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>

        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Studio Email Address
          </label>
          <input
            type="email"
            value={settings.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>

        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            GSTIN / Tax Identification
          </label>
          <input
            type="text"
            value={settings.gstin || ""}
            onChange={(e) => handleChange("gstin", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-sm uppercase"
          />
        </div>

        <div>
          <label className="block font-medium text-muted-foreground mb-1">
            Default GST / Tax Rate (%)
          </label>
          <input
            type="number"
            value={settings.tax_percent_default || "5"}
            onChange={(e) => handleChange("tax_percent_default", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-semibold"
          />
        </div>
      </div>

      {/* Number Sequence Prefixes */}
      <div className="border-t border-border pt-4">
        <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
          <Hash className="w-4 h-4" /> Sequence Prefix Configuration
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-medium text-muted-foreground mb-1">Order Prefix</label>
            <input
              type="text"
              value={settings.order_prefix || "AZ"}
              onChange={(e) => handleChange("order_prefix", e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-border bg-background font-mono text-xs uppercase"
            />
          </div>
          <div>
            <label className="block font-medium text-muted-foreground mb-1">Quotation Prefix</label>
            <input
              type="text"
              value={settings.quote_prefix || "QT"}
              onChange={(e) => handleChange("quote_prefix", e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-border bg-background font-mono text-xs uppercase"
            />
          </div>
          <div>
            <label className="block font-medium text-muted-foreground mb-1">Payment Prefix</label>
            <input
              type="text"
              value={settings.payment_prefix || "PAY"}
              onChange={(e) => handleChange("payment_prefix", e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-border bg-background font-mono text-xs uppercase"
            />
          </div>
          <div>
            <label className="block font-medium text-muted-foreground mb-1">Lead Prefix</label>
            <input
              type="text"
              value={settings.lead_prefix || "LD"}
              onChange={(e) => handleChange("lead_prefix", e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-border bg-background font-mono text-xs uppercase"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
