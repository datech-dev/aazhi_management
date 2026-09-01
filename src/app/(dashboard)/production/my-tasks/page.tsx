import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTailorAssignedTasks } from "@/services/production.service";
import { TailorMyTasks } from "@/components/production/tailor-my-tasks";
import { PageHeader } from "@/components/shared/page-header";
import { Kanban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Assigned Tailoring Tasks | Aazhi Designer Studio",
};

export default async function MyTasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const assignedOrders = await getTailorAssignedTasks(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`My Workbench Queue (${assignedOrders.length})`}
        subtitle={`Welcome, ${session.user.name || "Master Tailor"}. Here are your assigned custom tailoring and cutting jobs.`}
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
              Full Workshop Board
            </Link>

            <Link
              href="/measurements"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              Client Measurements
            </Link>
          </div>
        }
      />

      <TailorMyTasks orders={assignedOrders} />
    </div>
  );
}
