import Link from "next/link";
import { getKanbanBoardData } from "@/services/production.service";
import { ProductionKanbanBoard } from "@/components/production/production-kanban-board";
import { PageHeader } from "@/components/shared/page-header";
import { Users, Scissors, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Production Pipeline Kanban | Aazhi Designer Studio",
};

export default async function ProductionPage() {
  const { columns, tailors, totalActive } = await getKanbanBoardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workshop Production Pipeline"
        subtitle={`Track and advance ${totalActive} active custom tailoring garments across cutting, stitching, aari embroidery, and QC.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/production/tailors"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <Users className="w-4 h-4 mr-1.5" />
              Tailor Capacity &amp; Workload
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

            <Link
              href="/orders/new"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground shadow-sm",
              })}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Book New Order
            </Link>
          </div>
        }
      />

      {/* Interactive Kanban Board */}
      <ProductionKanbanBoard initialColumns={columns} tailors={tailors} />
    </div>
  );
}
