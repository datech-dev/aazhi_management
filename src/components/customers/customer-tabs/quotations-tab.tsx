import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { FileSpreadsheet, Plus, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface QuotationsTabProps {
  customerId: string;
  quotations: {
    id: string;
    quoteNumber: string;
    status: string;
    total: unknown;
    validUntil: Date | null;
    createdAt: Date;
  }[];
}

export function QuotationsTab({ customerId, quotations }: QuotationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold font-heading text-foreground">
            Price Estimates & Quotations ({quotations.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Formal price quotations issued for bespoke design inquiries
          </p>
        </div>
        <Link
          href={`/quotations/new?customerId=${customerId}`}
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className: "text-xs bg-primary text-primary-foreground hover:bg-primary/90",
          })}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Create Quotation
        </Link>
      </div>

      {quotations.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold font-heading text-foreground">
            No quotations created yet
          </h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Generate formal boutique quotations for bridal inquiries or bulk orders.
          </p>
          <div className="mt-4">
            <Link
              href={`/quotations/new?customerId=${customerId}`}
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground",
              })}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Generate First Quote
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {quotations.map((quote) => (
            <div
              key={quote.id}
              className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center justify-between gap-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm font-heading text-primary">
                    {quote.quoteNumber}
                  </span>
                  <StatusBadge status={quote.status} />
                </div>
                <div className="text-xs text-muted-foreground">
                  Issued on {formatDate(quote.createdAt)}
                  {quote.validUntil && ` • Valid until ${formatDate(quote.validUntil)}`}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold font-heading text-foreground">
                    {formatCurrency(Number(quote.total))}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Estimated Total</div>
                </div>

                <Link
                  href={`/quotations/${quote.id}`}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "h-8 px-2 text-xs",
                  })}
                >
                  View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
