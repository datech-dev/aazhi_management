import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuotationStatus } from "@prisma/client";
import { FileText, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface QuotationRow {
  id: string;
  quoteNumber: string;
  status: QuotationStatus;
  validUntil?: Date | null;
  total: unknown;
  createdAt: Date;
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
    whatsappNumber: string | null;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
  }[];
}

interface QuotationTableProps {
  quotations: QuotationRow[];
}

export function QuotationTable({ quotations }: QuotationTableProps) {
  if (quotations.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold font-heading text-foreground">
          No quotations recorded yet
        </h4>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Create customized price estimates for bridal wear, lehengas, or bulk festive orders.
        </p>
        <div className="mt-4">
          <Link
            href="/quotations/new"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-primary text-primary-foreground",
            })}
          >
            Create First Quotation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-4">Quotation #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Inclusions</th>
              <th className="p-4">Status</th>
              <th className="p-4">Valid Until</th>
              <th className="p-4">Estimated Total</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotations.map((q) => (
              <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-bold text-sm text-primary font-heading">
                  {q.quoteNumber}
                </td>
                <td className="p-4">
                  <Link
                    href={`/customers/${q.customer.id}`}
                    className="font-bold text-foreground hover:text-primary transition-colors block"
                  >
                    {q.customer.fullName}
                  </Link>
                  <span className="text-muted-foreground text-[11px] font-mono">
                    {q.customer.phone || q.customer.whatsappNumber || "No contact"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="font-medium text-foreground">
                    {q.items.length} {q.items.length === 1 ? "Item" : "Items"}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                    {q.items.map((i) => i.description).join(", ")}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border uppercase">
                    {q.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">
                  {q.validUntil ? formatDate(q.validUntil) : "Open"}
                </td>
                <td className="p-4 font-bold text-foreground text-sm font-heading">
                  {formatCurrency(Number(q.total))}
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={`/orders/new?customerId=${q.customer.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-7 px-2.5 text-xs text-primary hover:bg-primary/10",
                    })}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Convert to Order
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
