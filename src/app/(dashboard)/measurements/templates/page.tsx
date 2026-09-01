import Link from "next/link";
import { getMeasurementTemplates } from "@/services/measurement.service";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, Scissors, Layers, CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MeasurementTemplatesPage() {
  const templates = await getMeasurementTemplates();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garment Measurement Templates"
        subtitle="Configure standard body measurement fields and master cutting points for each garment type."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/measurements"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              ← Back to Profiles
            </Link>

            <Link
              href="/measurements/templates/new"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground shadow-sm",
              })}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Template
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-heading text-foreground">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {template.category || "Standard Garment"}
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {template._count.profiles} client profiles
              </span>
            </div>

            {/* Fields Pill List */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-muted-foreground">
                Measurement Points ({template.fields.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {template.fields.map((field) => (
                  <span
                    key={field.id}
                    className="text-xs px-2 py-0.5 rounded bg-muted/50 border border-border/60 text-foreground font-medium"
                  >
                    {field.name}
                    {field.isRequired && <span className="text-destructive ml-0.5">*</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Active Template
              </span>

              <Link
                href={`/measurements/new?templateId=${template.id}`}
                className="font-semibold text-primary hover:underline"
              >
                Use Template →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
