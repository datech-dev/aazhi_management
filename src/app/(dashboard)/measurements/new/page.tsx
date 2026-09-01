import { prisma } from "@/lib/prisma";
import { getMeasurementTemplates } from "@/services/measurement.service";
import { MeasurementProfileForm } from "@/components/measurements/measurement-profile-form";
import { PageHeader } from "@/components/shared/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Take New Measurements | Aazhi Designer Studio",
};

interface NewMeasurementPageProps {
  searchParams: Promise<{
    customerId?: string;
    templateId?: string;
  }>;
}

export default async function NewMeasurementPage({ searchParams }: NewMeasurementPageProps) {
  const params = await searchParams;

  const [customers, templates] = await Promise.all([
    prisma.customer.findMany({
      where: { isArchived: false },
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: "asc" },
    }),
    getMeasurementTemplates(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Client Measurements"
        subtitle="Capture precise tailor measurements for blouses, kurtis, lehengas, or custom bridal wear."
      />

      <MeasurementProfileForm
        customers={customers}
        templates={templates}
        initialCustomerId={params.customerId}
        initialTemplateId={params.templateId}
      />
    </div>
  );
}
