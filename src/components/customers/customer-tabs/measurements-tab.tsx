import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Ruler, Plus, Scissors, CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface MeasurementsTabProps {
  customerId: string;
  profiles: {
    id: string;
    version: number;
    unit: string;
    notes: string | null;
    createdAt: Date;
    template: {
      id: string;
      name: string;
      fields: {
        id: string;
        name: string;
        key: string;
      }[];
    };
    values: {
      id: string;
      fieldKey: string;
      value: unknown;
    }[];
  }[];
}

export function MeasurementsTab({ customerId, profiles }: MeasurementsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold font-heading text-foreground">
            Client Measurement Profiles
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active tailor measurement templates and recorded values
          </p>
        </div>
        <Link
          href={`/measurements/new?customerId=${customerId}`}
          className={buttonVariants({
            variant: "default",
            size: "sm",
            className: "text-xs bg-primary text-primary-foreground hover:bg-primary/90",
          })}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Take New Measurements
        </Link>
      </div>

      {profiles.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Ruler className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold font-heading text-foreground">
            No measurements recorded yet
          </h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Take blouse, salwar, or lehenga measurements for this client before starting tailor cutting.
          </p>
          <div className="mt-4">
            <Link
              href={`/measurements/new?customerId=${customerId}`}
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "bg-primary text-primary-foreground",
              })}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Record First Measurement
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => {
            const fieldMap = new Map(profile.template.fields.map((f) => [f.key, f.name]));

            return (
              <div
                key={profile.id}
                className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm font-heading">
                        {profile.template.name} Profile
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Version {profile.version} • {formatDate(profile.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {profile.unit}
                  </span>
                </div>

                {/* Values Grid */}
                {profile.values.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {profile.values.map((val) => (
                      <div
                        key={val.id}
                        className="p-2 rounded-lg bg-muted/40 border border-border/60 text-center"
                      >
                        <div className="text-[10px] text-muted-foreground font-medium truncate">
                          {fieldMap.get(val.fieldKey) || val.fieldKey}
                        </div>
                        <div className="text-xs font-bold text-foreground mt-0.5">
                          {String(val.value)}&quot;
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Measurement profile template initialized.
                  </p>
                )}

                {profile.notes && (
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                    <span className="font-semibold">Tailor Notes: </span>
                    {profile.notes}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-border/60 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Verified for Production
                  </span>
                  <Link
                    href={`/measurements/${profile.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
