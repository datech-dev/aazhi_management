import { Ruler, Scissors, Sparkles, Layers } from "lucide-react";

interface MeasurementStatsProps {
  stats: {
    totalProfiles: number;
    activeTemplates: number;
    blouseProfiles: number;
    kurtiProfiles: number;
    recentProfilesCount: number;
  };
}

export function MeasurementStatsCards({ stats }: MeasurementStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Total Client Profiles
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Ruler className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-foreground">
          {stats.totalProfiles}
        </div>
        <p className="text-xs text-muted-foreground">
          {stats.recentProfilesCount} updated in the last 30 days
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Blouse Measurements
          </span>
          <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
            <Scissors className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-pink-600">
          {stats.blouseProfiles}
        </div>
        <p className="text-xs text-muted-foreground">
          Bridal, Katori & Princess cut specifications
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Kurti / Salwar Profiles
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-purple-600">
          {stats.kurtiProfiles}
        </div>
        <p className="text-xs text-muted-foreground">
          Anarkali, A-line & straight cut sets
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-medium font-body uppercase tracking-wider">
            Garment Templates
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-heading text-foreground">
          {stats.activeTemplates}
        </div>
        <p className="text-xs text-muted-foreground">
          Active master cutting templates
        </p>
      </div>
    </div>
  );
}
