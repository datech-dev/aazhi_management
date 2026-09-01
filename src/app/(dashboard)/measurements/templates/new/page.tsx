import { TemplateForm } from "@/components/measurements/template-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Measurement Template | Aazhi Designer Studio",
};

export default function NewMeasurementTemplatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Garment Template"
        subtitle="Define body measurement dimensions and points for a new boutique garment type."
      />

      <TemplateForm />
    </div>
  );
}
