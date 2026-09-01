import Link from "next/link";
import {
  getMeasurementProfiles,
  getMeasurementTemplates,
  getMeasurementStats,
} from "@/services/measurement.service";
import { MeasurementStatsCards } from "@/components/measurements/measurement-stats-cards";
import { MeasurementFilterToolbar } from "@/components/measurements/measurement-filter-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";
import { Plus, Ruler, Scissors, Printer, Layers, Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface MeasurementsPageProps {
  searchParams: Promise<{
    search?: string;
    templateId?: string;
    customerId?: string;
    page?: string;
    pageSize?: string;
    sortBy?: "createdAt" | "version";
    sortOrder?: "asc" | "desc";
  }>;
}

export default async function MeasurementsPage({ searchParams }: MeasurementsPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 20;

  const [data, templates, stats] = await Promise.all([
    getMeasurementProfiles({
      search: params.search,
      templateId: params.templateId,
      customerId: params.customerId,
      page,
      pageSize,
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    }),
    getMeasurementTemplates(),
    getMeasurementStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Client Measurements & Cutting Sheets"
        subtitle="Manage tailor measurement profiles, dimensional points, revision histories, and printable cutting sheets."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/measurements/templates"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <Layers className="w-4 h-4 mr-1.5" />
              Templates ({templates.length})
            </Link>

            <Link
              href="/measurements/new"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground shadow-sm",
              })}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Measurement
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <MeasurementStatsCards stats={stats} />

      {/* Filter Toolbar */}
      <MeasurementFilterToolbar templates={templates} />

      {/* Measurement Profiles List */}
      {data.profiles.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Ruler className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold font-heading text-foreground">
            No measurement records found
          </h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Take blouse, kurti, or lehenga measurements for a customer to generate their first cutting sheet.
          </p>
          <div className="mt-4">
            <Link
              href="/measurements/new"
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground",
              })}
            >
              Record First Measurement
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.profiles.map((profile) => {
            const fieldMap = new Map(profile.template.fields.map((f) => [f.key, f.name]));

            return (
              <div
                key={profile.id}
                className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/customers/${profile.customer.id}`}
                        className="font-bold text-sm text-foreground hover:text-primary transition-colors font-heading"
                      >
                        {profile.customer.fullName}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">
                        {profile.customer.phone || profile.customer.whatsappNumber || "No phone"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 inline-block">
                        {profile.template.name} • v{profile.version}
                      </span>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {formatDate(profile.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Values preview */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-1">
                    {profile.values.slice(0, 8).map((val) => (
                      <div
                        key={val.id}
                        className="p-1.5 rounded-md bg-muted/40 border border-border/50 text-center"
                      >
                        <div className="text-[9px] text-muted-foreground font-medium truncate" title={fieldMap.get(val.fieldKey) || val.fieldKey}>
                          {fieldMap.get(val.fieldKey) || val.fieldKey}
                        </div>
                        <div className="text-xs font-bold text-foreground mt-0.5">
                          {String(val.value)}{profile.unit === "INCHES" ? "″" : "cm"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {profile.notes && (
                    <div className="p-2 rounded-md bg-muted/40 border border-border/60 text-xs text-muted-foreground line-clamp-2 italic">
                      &quot;{profile.notes}&quot;
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    By {profile.createdBy.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/measurements/${profile.id}/print`}
                      target="_blank"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "h-7 px-2 text-xs",
                      })}
                      title="Print A4 Cutting Sheet"
                    >
                      <Printer className="w-3 h-3 mr-1" />
                      Print
                    </Link>

                    <Link
                      href={`/measurements/${profile.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        className: "h-7 px-2 text-xs font-semibold text-primary",
                      })}
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, data.pagination.totalCount)} of{" "}
            {data.pagination.totalCount} profiles
          </span>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <Link
                href={`/measurements?page=${page - 1}${params.search ? `&search=${params.search}` : ""}`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs" })}
              >
                Previous
              </Link>
            )}
            <span className="px-3 py-1 font-semibold text-foreground">
              Page {page} of {data.pagination.totalPages}
            </span>
            {page < data.pagination.totalPages && (
              <Link
                href={`/measurements?page=${page + 1}${params.search ? `&search=${params.search}` : ""}`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs" })}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
