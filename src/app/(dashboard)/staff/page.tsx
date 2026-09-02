import { getStaffList, getAllPermissions } from "@/services/staff.service";
import { StaffTable } from "@/components/staff/staff-table";
import { UserCog, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Staff Administration & RBAC | Aazhi Designer Studio",
  description: "Manage employee accounts, system roles, and custom permission overrides",
};

interface StaffPageProps {
  searchParams: Promise<{
    role?: string;
    search?: string;
  }>;
}

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const params = await searchParams;

  const [staffList, permissions] = await Promise.all([
    getStaffList({
      role: params.role as any,
      search: params.search,
    }),
    getAllPermissions(),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" />
            Staff Administration & RBAC System Roles
          </h1>
          <p className="text-sm text-muted-foreground">
            Onboard boutique staff, assign roles (Owner, Admin, Tailor, Sales), and manage permission overrides.
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <StaffTable staff={staffList as any} />
    </div>
  );
}
