import { getDeliveriesList } from "@/services/delivery.service";
import { DeliveryQueueTable } from "@/components/deliveries/delivery-queue-table";
import { Truck } from "lucide-react";

export const metadata = {
  title: "Delivery Logistics & Dispatch | Aazhi Designer Studio",
  description: "Track customer pickups, local handovers, and courier dispatches",
};

interface DeliveriesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    method?: string;
    page?: string;
  }>;
}

export default async function DeliveriesPage({ searchParams }: DeliveriesPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const deliveriesResult = await getDeliveriesList({
    search: params.search,
    status: params.status as any,
    deliveryMethod: params.method as any,
    page,
    pageSize: 20,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Delivery & Dispatch Logistics Queue
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage boutique customer pickups, local delivery dispatches, and courier tracking.
          </p>
        </div>
      </div>

      {/* Dispatch Table */}
      <DeliveryQueueTable deliveries={deliveriesResult.items as any} />
    </div>
  );
}
