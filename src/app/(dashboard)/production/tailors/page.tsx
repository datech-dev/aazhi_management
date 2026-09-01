import Link from "next/link";
import { getTailorCapacityOverview } from "@/services/production.service";
import { TailorCapacityOverview } from "@/components/production/tailor-capacity-overview";
import { PageHeader } from "@/components/shared/page-header";
import { Kanban, Scissors } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tailor Work Allocation & Capacity | Aazhi Designer Studio",
};

export default async function TailorCapacityPage() {
  const tailorWorkloads = await getTailorCapacityOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tailor Work Allocation &amp; Capacity Hub"
        subtitle="Monitor workbench utilization, active garments in cutting & stitching, and balance master tailor workloads."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/production"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <Kanban className="w-4 h-4 mr-1.5" />
              Workshop Kanban Board
            </Link>

            <Link
              href="/production/my-tasks"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <Scissors className="w-4 h-4 mr-1.5" />
              My Assigned Tasks
            </Link>
          </div>
        }
      />

      <TailorCapacityOverview tailors={tailorWorkloads} />
    </div>
  );
}
