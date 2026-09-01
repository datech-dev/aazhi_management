import { prisma } from "@/lib/prisma";
import { QuotationForm } from "@/components/quotations/quotation-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create Quotation | Aazhi Designer Studio",
};

export default async function NewQuotationPage() {
  const customers = await prisma.customer.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      fullName: true,
      phone: true,
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Price Quotation"
        subtitle="Draft a formal couture price estimate with item breakdowns, fabric options, and validity dates."
      />

      <QuotationForm customers={customers} />
    </div>
  );
}
