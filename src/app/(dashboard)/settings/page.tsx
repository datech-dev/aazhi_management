import { getBusinessSettings, getAuditLogs } from "@/services/settings.service";
import { SettingsTabContainer } from "@/components/settings/settings-tab-container";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio Business Settings | Aazhi Designer Studio",
  description: "Boutique branding, sequence numbering, tax defaults, and social integrations",
};

interface SettingsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;

  const [settings, auditLogsResult] = await Promise.all([
    getBusinessSettings(),
    getAuditLogs({ search: params.search }),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Studio Business Settings & Integrations
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage studio branding, WhatsApp & Instagram live API connections, sequence numbers, and system audit logs.
          </p>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <SettingsTabContainer settings={settings} auditLogs={auditLogsResult.items as any} />
    </div>
  );
}
