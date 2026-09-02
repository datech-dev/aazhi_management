import { getLeadsList } from "@/services/lead.service";
import { getCustomers } from "@/services/customer.service";
import { LeadKanbanBoard } from "@/components/leads/lead-kanban-board";
import { Target, Plus } from "lucide-react";

export const metadata = {
  title: "Inquiry Leads & Sales Pipeline | Aazhi Designer Studio",
  description: "Boutique sales pipeline, social inquiry tracking, and lead conversion",
};

interface LeadsPageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    search?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;

  const [leadsResult, customersResult] = await Promise.all([
    getLeadsList({
      status: params.status as any,
      priority: params.priority as any,
      search: params.search,
    }),
    getCustomers({ pageSize: 100 }),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Inquiry Leads & Sales Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Track prospective client enquiries, quote dispatches, negotiations, and conversions.
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <LeadKanbanBoard leads={leadsResult.items as any} />
    </div>
  );
}
