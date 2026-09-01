"use client";

import { useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { Printer, Scissors, CheckSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface PrintableTailorSheetProps {
  profile: {
    id: string;
    version: number;
    unit: string;
    notes: string | null;
    createdAt: Date;
    customer: {
      fullName: string;
      phone: string | null;
      whatsappNumber: string | null;
    };
    template: {
      name: string;
      fields: {
        id: string;
        name: string;
        key: string;
      }[];
    };
    order?: {
      id: string;
      orderNumber: string;
      status: string;
      expectedDeliveryDate: Date | null;
    } | null;
    createdBy: {
      name: string;
    };
    values: {
      fieldKey: string;
      value: unknown;
    }[];
  };
  autoPrint?: boolean;
}

export function PrintableTailorSheet({ profile, autoPrint = false }: PrintableTailorSheetProps) {
  useEffect(() => {
    if (autoPrint) {
      window.print();
    }
  }, [autoPrint]);

  const fieldMap = new Map(profile.template.fields.map((f) => [f.key, f.name]));

  return (
    <div className="space-y-6">
      {/* Action Toolbar (Hidden during print) */}
      <div className="print:hidden flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="font-bold text-foreground text-sm">
            Master Tailor Cutting Job Sheet
          </h2>
          <p className="text-xs text-muted-foreground">
            Printable A4 sheet formatted for tailor cutting desk and production clipboards
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className: "bg-primary text-primary-foreground font-semibold shadow-sm",
          })}
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print Job Sheet
        </button>
      </div>

      {/* A4 Printable Sheet Container */}
      <div className="bg-white text-black p-8 rounded-xl border border-border print:border-none print:p-0 shadow-sm max-w-4xl mx-auto font-sans">
        {/* Boutique Header */}
        <div className="border-b-2 border-black pb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase font-heading text-black">
              Aazhi Designer Studio
            </h1>
            <p className="text-xs text-neutral-600 uppercase tracking-widest font-semibold mt-0.5">
              Boutique Tailoring &amp; Bridal Studio • Cutting Job Sheet
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Chennai, Tamil Nadu • Phone / WhatsApp: +91 98401 23456
            </p>
          </div>

          <div className="text-right space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-1 rounded inline-block">
              {profile.template.name} • v{profile.version}
            </div>
            <div className="text-xs text-neutral-600 pt-1 font-mono">
              Recorded: {formatDate(profile.createdAt)}
            </div>
            {profile.order && (
              <div className="text-sm font-black text-black">
                Order: #{profile.order.orderNumber}
              </div>
            )}
          </div>
        </div>

        {/* Client & Target Delivery Bar */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b border-neutral-300 text-xs">
          <div>
            <span className="font-bold text-neutral-500 block uppercase text-[10px]">
              Client Name
            </span>
            <span className="text-sm font-bold text-black">{profile.customer.fullName}</span>
          </div>

          <div>
            <span className="font-bold text-neutral-500 block uppercase text-[10px]">
              Contact Phone
            </span>
            <span className="text-xs font-semibold text-black font-mono">
              {profile.customer.phone || profile.customer.whatsappNumber || "N/A"}
            </span>
          </div>

          <div>
            <span className="font-bold text-neutral-500 block uppercase text-[10px]">
              Target Delivery Date
            </span>
            <span className="text-xs font-bold text-black">
              {profile.order?.expectedDeliveryDate
                ? formatDate(profile.order.expectedDeliveryDate)
                : "Standard Schedule"}
            </span>
          </div>
        </div>

        {/* Measurements Grid */}
        <div className="py-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5" />
              Tailor Cutting Dimensions ({profile.unit})
            </h3>
            <span className="text-[11px] font-bold text-neutral-600">
              Unit: {profile.unit === "INCHES" ? "Inches (\")" : "Centimeters (cm)"}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {profile.values.map((v) => (
              <div
                key={v.fieldKey}
                className="border-2 border-neutral-800 rounded p-2.5 text-center bg-neutral-50"
              >
                <div className="text-[10px] font-bold uppercase text-neutral-600 tracking-wider truncate">
                  {fieldMap.get(v.fieldKey) || v.fieldKey}
                </div>
                <div className="text-base font-black text-black mt-1 font-mono">
                  {String(v.value)}
                  <span className="text-xs font-normal text-neutral-500 ml-0.5">
                    {profile.unit === "INCHES" ? "″" : "cm"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Master Tailor Cutting Notes */}
        <div className="py-4 border-t border-neutral-300">
          <h4 className="text-[11px] font-black uppercase text-black mb-1.5">
            Special Tailor Cutting Instructions &amp; Neckline Specs:
          </h4>
          <div className="p-3 border border-neutral-400 rounded bg-neutral-50 min-h-[60px] text-xs text-neutral-800 whitespace-pre-line leading-relaxed">
            {profile.notes || "Standard cutting allowance with 1.5-inch side margin ease."}
          </div>
        </div>

        {/* Workshop Verification & QC Signoff */}
        <div className="pt-6 mt-4 border-t-2 border-black grid grid-cols-3 gap-6 text-xs">
          <div className="space-y-4">
            <span className="font-bold text-neutral-500 uppercase text-[10px]">
              Master Cutter
            </span>
            <div className="h-8 border-b border-dashed border-black" />
            <span className="text-[10px] text-neutral-400">Signature / Date</span>
          </div>

          <div className="space-y-4">
            <span className="font-bold text-neutral-500 uppercase text-[10px]">
              Assigned Tailor
            </span>
            <div className="h-8 border-b border-dashed border-black" />
            <span className="text-[10px] text-neutral-400">Signature / Date</span>
          </div>

          <div className="space-y-4">
            <span className="font-bold text-neutral-500 uppercase text-[10px]">
              QC Verification
            </span>
            <div className="flex items-center gap-2 pt-2">
              <div className="w-4 h-4 border-2 border-black rounded flex items-center justify-center text-[10px] font-bold" />
              <span className="text-xs font-semibold">Ready for Trial / Dispatch</span>
            </div>
            <span className="text-[10px] text-neutral-400 block pt-1">QC Inspector Sign</span>
          </div>
        </div>
      </div>
    </div>
  );
}
