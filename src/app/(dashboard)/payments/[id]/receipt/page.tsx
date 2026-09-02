import { getPaymentDetails } from "@/services/payment.service";
import { PaymentReceipt } from "@/components/payments/payment-receipt";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Print Payment Receipt | Aazhi Designer Studio",
  description: "Printable official payment receipt",
};

interface ReceiptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;

  try {
    const payment = await getPaymentDetails(id);
    return <PaymentReceipt payment={payment as any} />;
  } catch (error) {
    notFound();
  }
}
