"use client";

import { useState } from "react";
import { BusinessSettingsForm } from "./business-settings-form";
import { IntegrationsSettingsForm } from "./integrations-settings-form";
import { AuditLogTable } from "./audit-log-table";
import { Building, MessageSquare, ShieldCheck, History } from "lucide-react";

interface SettingsTabContainerProps {
  settings: Record<string, string>;
  auditLogs: any[];
}

export function SettingsTabContainer({ settings, auditLogs }: SettingsTabContainerProps) {
  const [activeTab, setActiveTab] = useState<"general" | "integrations" | "audit">("general");

  return (
    <div className="space-y-6">
      {/* Tabs Bar */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Branding & Tax Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "integrations"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>WhatsApp & Instagram Integrations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "audit"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          <span>System Audit Logs</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "general" && <BusinessSettingsForm initialSettings={settings} />}
      {activeTab === "integrations" && <IntegrationsSettingsForm initialSettings={settings} />}
      {activeTab === "audit" && <AuditLogTable logs={auditLogs} />}
    </div>
  );
}
