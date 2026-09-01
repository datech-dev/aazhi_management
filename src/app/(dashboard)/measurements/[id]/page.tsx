import { notFound } from "next/navigation";
import Link from "next/link";
import { getMeasurementProfileById } from "@/services/measurement.service";
import { PrintableTailorSheet } from "@/components/measurements/printable-tailor-sheet";
import { PageHeader } from "@/components/shared/page-header";
import { Printer, ArrowLeft, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface MeasurementDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MeasurementDetailPage({ params }: MeasurementDetailPageProps) {
  const { id } = await params;
  const profile = await getMeasurementProfileById(id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="print:hidden">
        <PageHeader
          title={`${profile.customer.fullName} — ${profile.template.name} Measurements`}
          subtitle={`Version ${profile.version} • Created on ${profile.createdAt.toLocaleDateString()}`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href={`/customers/${profile.customerId}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                })}
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                Client 360 Profile
              </Link>

              <Link
                href={`/measurements/${profile.id}/print`}
                target="_blank"
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "bg-primary text-primary-foreground",
                })}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Job Sheet
              </Link>
            </div>
          }
        />
      </div>

      <PrintableTailorSheet profile={profile} autoPrint={false} />
    </div>
  );
}
