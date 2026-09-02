import { getAuditLogs } from "@/services/settings.service";
import { Bell, CheckCircle, Clock, Info, ShieldAlert } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notifications & System Alerts | Aazhi Designer Studio",
  description: "Recent order status changes, tailor assignments, and studio notifications",
};

export default async function NotificationsPage() {
  const auditLogsResult = await getAuditLogs({ pageSize: 20 });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications & System Activity Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time feed of order progression, tailor work allocations, and system audit events.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden divide-y divide-border/60">
        {auditLogsResult.items.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No active notifications or alerts.
          </div>
        ) : (
          auditLogsResult.items.map((log) => (
            <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-foreground">
                    {log.action.toUpperCase()} — {log.entityType.toUpperCase()}
                  </p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Actor: <span className="font-semibold text-foreground">{log.user?.name || "System Automated"}</span>
                </p>
                {log.newValue && (
                  <pre className="mt-2 text-[11px] p-2 bg-muted/50 rounded font-mono text-muted-foreground overflow-x-auto">
                    {JSON.stringify(log.newValue, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
