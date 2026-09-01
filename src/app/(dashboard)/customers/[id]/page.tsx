import { notFound } from "next/navigation";
import { getCustomerById } from "@/services/customer.service";
import { CustomerProfileHeader } from "@/components/customers/customer-profile-header";
import { OverviewTab } from "@/components/customers/customer-tabs/overview-tab";
import { MeasurementsTab } from "@/components/customers/customer-tabs/measurements-tab";
import { OrdersTab } from "@/components/customers/customer-tabs/orders-tab";
import { QuotationsTab } from "@/components/customers/customer-tabs/quotations-tab";
import { ActivityTab } from "@/components/customers/customer-tabs/activity-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Ruler, ShoppingBag, FileSpreadsheet, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  // Calculate total outstanding balance
  const totalBalance = customer.orders.reduce(
    (acc, order) => acc + Number(order.balance || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* 360 Hero Header */}
      <CustomerProfileHeader customer={customer} totalBalance={totalBalance} />

      {/* Tabbed Navigation */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl w-full sm:w-auto flex flex-wrap justify-start gap-1 h-auto shadow-sm">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-3 rounded-lg"
          >
            <User className="w-3.5 h-3.5 mr-1.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="measurements"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-3 rounded-lg"
          >
            <Ruler className="w-3.5 h-3.5 mr-1.5" />
            Measurements ({customer.measurementProfiles.length})
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-3 rounded-lg"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Orders ({customer.orders.length})
          </TabsTrigger>
          <TabsTrigger
            value="quotations"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-3 rounded-lg"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Quotations ({customer.quotations.length})
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2 px-3 rounded-lg"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="focus-visible:outline-none">
          <OverviewTab customer={customer} />
        </TabsContent>

        <TabsContent value="measurements" className="focus-visible:outline-none">
          <MeasurementsTab customerId={customer.id} profiles={customer.measurementProfiles} />
        </TabsContent>

        <TabsContent value="orders" className="focus-visible:outline-none">
          <OrdersTab customerId={customer.id} orders={customer.orders} />
        </TabsContent>

        <TabsContent value="quotations" className="focus-visible:outline-none">
          <QuotationsTab customerId={customer.id} quotations={customer.quotations} />
        </TabsContent>

        <TabsContent value="activity" className="focus-visible:outline-none">
          <ActivityTab
            conversations={customer.conversations}
            ordersCount={customer.totalOrders || customer.orders.length}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
