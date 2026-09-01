import { prisma } from "@/lib/prisma";
import { OrderBookingWizard } from "@/components/orders/order-booking-wizard";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book New Order | Aazhi Designer Studio",
};

interface NewOrderPageProps {
  searchParams: Promise<{
    customerId?: string;
    productId?: string;
  }>;
}

export default async function NewOrderPage({ searchParams }: NewOrderPageProps) {
  const params = await searchParams;

  const [customers, products, measurementProfiles] = await Promise.all([
    prisma.customer.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        fullName: true,
        phone: true,
        whatsappNumber: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.measurementProfile.findMany({
      select: {
        id: true,
        customerId: true,
        version: true,
        template: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    basePrice: Number(p.price),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boutique Multi-Item Booking Wizard"
        subtitle="Create bespoke tailoring orders, attach cutting measurements, configure GST, and record initial advance payments."
      />

      <OrderBookingWizard
        customers={customers}
        products={formattedProducts}
        measurementProfiles={measurementProfiles}
        initialCustomerId={params.customerId}
        initialProductId={params.productId}
      />
    </div>
  );
}
