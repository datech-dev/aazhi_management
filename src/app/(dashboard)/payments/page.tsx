import { getPaymentsList, getFinancialSummary } from "@/services/payment.service";
import { FinancialSummaryCards } from "@/components/payments/financial-summary-cards";
import { PaymentLedgerTable } from "@/components/payments/payment-ledger-table";
import { CreditCard, IndianRupee } from "lucide-react";

export const metadata = {
  title: "Payments Ledger & Financials | Aazhi Designer Studio",
  description: "Decimal-safe financial management, payment history, and collection reports",
};

interface PaymentsPageProps {
  searchParams: Promise<{
    search?: string;
    method?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [financialSummary, paymentsResult] = await Promise.all([
    getFinancialSummary(),
    getPaymentsList({
      search: params.search,
      method: params.method as any,
      type: params.type as any,
      page,
      pageSize: 20,
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Financial Management & Payment Ledger
          </h1>
          <p className="text-sm text-muted-foreground">
            Track advance payments, UPI collections, balance settlements, and payment receipts.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <FinancialSummaryCards summary={financialSummary} />

      {/* Payment Ledger Table */}
      <PaymentLedgerTable
        payments={paymentsResult.items as any}
        pagination={paymentsResult.pagination}
      />
    </div>
  );
}
