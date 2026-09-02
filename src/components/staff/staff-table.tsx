"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import {
  UserCog,
  Shield,
  CheckCircle,
  XCircle,
  Key,
  Edit,
  UserCheck,
  Search,
} from "lucide-react";
import { updateStaffRoleAction, toggleStaffStatusAction } from "@/actions/staff.actions";
import { toast } from "sonner";

interface StaffItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
  branch: {
    id: string;
    name: string;
    code: string;
  } | null;
  userPermissions?: any[];
}

interface StaffTableProps {
  staff: StaffItem[];
  onOpenPermissions?: (userId: string, userName: string) => void;
}

const ROLES: UserRole[] = ["OWNER", "ADMIN", "SALES", "TAILOR", "STAFF"];

export function StaffTable({ staff, onOpenPermissions }: StaffTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));

    const matchesRole = roleFilter === "ALL" || s.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const res = await updateStaffRoleAction(userId, newRole);
      if (res.success) {
        toast.success(`Role updated to ${newRole}`);
      } else {
        toast.error(res.error || "Failed to update role");
      }
    } catch {
      toast.error("Error updating role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      const res = await toggleStaffStatusAction(userId, !currentStatus);
      if (res.success) {
        toast.success(`Account ${!currentStatus ? "activated" : "deactivated"}`);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Error toggling status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "OWNER":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            👑 Owner
          </span>
        );
      case "ADMIN":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            🛡️ Admin
          </span>
        );
      case "SALES":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            🛍️ Sales Executive
          </span>
        );
      case "TAILOR":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            ✂️ Master Tailor
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20">
            👤 Staff
          </span>
        );
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border/60 shadow-sm overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/20">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search team member name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", ...ROLES].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {r === "ALL" ? "All Roles" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border/60">
            <tr>
              <th className="px-4 py-3">Team Member</th>
              <th className="px-4 py-3">System Role</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  No staff members found matching your search.
                </td>
              </tr>
            ) : (
              filteredStaff.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs font-heading">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{user.name}</p>
                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={updatingId === user.id}
                      className="text-xs bg-muted/40 border border-border rounded px-2 py-1 font-semibold"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {user.phone || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {user.branch?.code || "Main Studio"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      disabled={updatingId === user.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-500/10 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {onOpenPermissions && (
                      <button
                        onClick={() => onOpenPermissions(user.id, user.name)}
                        className="px-2.5 py-1 text-xs rounded bg-muted hover:bg-muted/80 font-medium text-foreground flex items-center gap-1 mx-auto"
                      >
                        <Shield className="w-3.5 h-3.5 text-primary" /> Permissions
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
