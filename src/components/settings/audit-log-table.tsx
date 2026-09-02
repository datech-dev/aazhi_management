"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { History, Search, User, Shield, Activity } from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: any;
  newValue: any;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface AuditLogTableProps {
  logs: AuditLogItem[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((log) => {
    return (
      search === "" ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      (log.user && log.user.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border/60 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            System Activity Audit Trail
          </h3>
          <p className="text-xs text-muted-foreground">
            Immutable log of status changes, payments, and administrative actions
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action, entity, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border/60">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor / User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity Type</th>
              <th className="px-4 py-3">Log Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  No activity audit entries recorded.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-foreground">
                    {log.user ? log.user.name : "System / Automated"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground uppercase">
                    {log.entityType}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                    {log.newValue ? JSON.stringify(log.newValue) : "N/A"}
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
