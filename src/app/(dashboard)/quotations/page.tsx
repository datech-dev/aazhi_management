import Link from "next/link";
import { getQuotations } from "@/services/order.service";
import { QuotationTable } from "@/components/quotations/quotation-table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const quotations = await getQuotations();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boutique Estimates &amp; Quotations"
        subtitle="Manage custom price estimates for bridal wear, couture collections, and multi-piece orders."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              Orders Directory
            </Link>

            <Link
              href="/quotations/new"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground shadow-sm",
              })}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Quotation
            </Link>
          </div>
        }
      />

      <QuotationTable quotations={quotations} />
    </div>
  );
}
