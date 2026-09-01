"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/actions/order.actions";
import {
  CheckCircle,
  Clock,
  Scissors,
  Sparkles,
  Ruler,
  CheckCheck,
  PackageCheck,
  Truck,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const STAGES: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { status: "MEASUREMENT_PENDING", label: "Measurements", icon: Ruler },
  { status: "CUTTING", label: "Master Cutting", icon: Scissors },
  { status: "STITCHING", label: "Tailoring", icon: Clock },
  { status: "FINISHING", label: "Finishing / Aari", icon: Sparkles },
  { status: "QUALITY_CHECK", label: "QC Check", icon: CheckCheck },
  { status: "READY", label: "Ready for Trial", icon: PackageCheck },
  { status: "DELIVERED", label: "Delivered", icon: Truck },
];

interface OrderLifecycleStepperProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderLifecycleStepper({ orderId, currentStatus }: OrderLifecycleStepperProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const currentIndex = STAGES.findIndex((s) => s.status === currentStatus);
  const nextStage =
    currentIndex >= 0 && currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1] : null;

  const handleStageChange = async (status: OrderStatus) => {
    setLoading(true);
    try {
      await updateOrderStatusAction(orderId, {
        status,
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base font-heading text-foreground">
            Production &amp; Fulfillment Lifecycle
          </h3>
          <p className="text-xs text-muted-foreground">
            Track garment movement across master cutting, tailoring, finishing, and QC inspection
          </p>
        </div>

        {nextStage && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleStageChange(nextStage.status)}
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-primary text-primary-foreground font-semibold shadow-sm",
            })}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <>
                Advance to {nextStage.label} <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Progress Stepper Line */}
      <div className="relative">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[720px] relative">
            {/* Background connecting bar */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-muted -translate-y-1/2 z-0" />

            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPassed = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={stage.status}
                  className="flex flex-col items-center relative z-10 space-y-2 cursor-pointer group"
                  onClick={() => handleStageChange(stage.status)}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 shadow-sm"
                        : isPassed
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground border border-border group-hover:border-primary/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="text-center">
                    <span
                      className={`text-xs block font-medium whitespace-nowrap ${
                        isCurrent
                          ? "text-primary font-bold"
                          : isPassed
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
