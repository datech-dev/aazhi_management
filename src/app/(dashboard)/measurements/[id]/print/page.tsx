import { notFound } from "next/navigation";
import { getMeasurementProfileById } from "@/services/measurement.service";
import { PrintableTailorSheet } from "@/components/measurements/printable-tailor-sheet";

export const dynamic = "force-dynamic";

interface PrintMeasurementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PrintMeasurementPage({ params }: PrintMeasurementPageProps) {
  const { id } = await params;
  const profile = await getMeasurementProfileById(id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen p-4 sm:p-8">
      <PrintableTailorSheet profile={profile} autoPrint={true} />
    </div>
  );
}
