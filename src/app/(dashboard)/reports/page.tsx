import {
  getRevenueAnalytics,
  getCategoryPerformance,
  getTailorProductivity,
  getCustomerLTVAnalytics,
} from "@/services/report.service";
import { ExecutiveKpiCards } from "@/components/reports/executive-kpi-cards";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { CategoryDistributionChart } from "@/components/reports/category-distribution-chart";
import { TailorPerformanceTable } from "@/components/reports/tailor-performance-table";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Executive Reports & Analytics | Aazhi Designer Studio",
  description: "Boutique revenue analytics, category distribution, and tailor productivity",
};

export default async function ReportsPage() {
  const [revenueData, categoryData, tailorData, ltvData] = await Promise.all([
    getRevenueAnalytics(),
    getCategoryPerformance(),
    getTailorProductivity(),
    getCustomerLTVAnalytics(),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Executive Reports & Studio Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Boutique revenue intake, garment sales distribution, and tailor efficiency leaderboard.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <ExecutiveKpiCards analytics={revenueData} ltvAnalytics={ltvData} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData.timeSeries} />
        </div>
        <div>
          <CategoryDistributionChart data={categoryData} />
        </div>
      </div>

      {/* Master Tailor Performance */}
      <TailorPerformanceTable tailors={tailorData} />
    </div>
  );
}
