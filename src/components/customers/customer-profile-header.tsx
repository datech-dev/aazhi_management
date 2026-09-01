import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Phone,
  MessageSquare,
  Edit,
  Plus,
  ShoppingBag,
  Ruler,
  Calendar,
} from "lucide-react";
import { InstagramIcon } from "@/components/shared/icons";
import { buttonVariants } from "@/components/ui/button";

interface CustomerHeaderProps {
  customer: {
    id: string;
    fullName: string;
    preferredName: string | null;
    phone: string | null;
    whatsappNumber: string | null;
    instagramUsername: string | null;
    email: string | null;
    source: string;
    totalOrders: number;
    totalLifetimeValue: unknown;
    createdAt: Date;
    lastOrderAt: Date | null;
    tags: {
      tag: {
        id: string;
        name: string;
        color: string;
      };
    }[];
  };
  totalBalance?: number;
}

export function CustomerProfileHeader({
  customer,
  totalBalance = 0,
}: CustomerHeaderProps) {
  const whatsappClean =
    customer.whatsappNumber?.replace(/[^0-9]/g, "") ||
    customer.phone?.replace(/[^0-9]/g, "");
  const formattedWA =
    whatsappClean && !whatsappClean.startsWith("91") && whatsappClean.length === 10
      ? `91${whatsappClean}`
      : whatsappClean;

  const cleanInsta = customer.instagramUsername?.replace(/^@/, "");

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Avatar and Basic Details */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center font-heading border-2 border-primary/20 flex-shrink-0 shadow-inner">
            {customer.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl font-bold font-heading text-foreground">
                {customer.fullName}
              </h1>
              {customer.preferredName && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({customer.preferredName})
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                Via {customer.source.toLowerCase().replace("_", " ")}
              </span>

              {customer.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    borderColor: `${tag.color}40`,
                    borderWidth: "1px",
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 text-xs" })}
            >
              <Phone className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Call
            </a>
          )}

          {formattedWA && (
            <a
              href={`https://wa.me/${formattedWA}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-9 text-xs text-emerald-600 border-emerald-300 hover:bg-emerald-50",
              })}
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              WhatsApp
            </a>
          )}

          {cleanInsta && (
            <a
              href={`https://instagram.com/${cleanInsta}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-9 text-xs text-pink-600 border-pink-300 hover:bg-pink-50",
              })}
            >
              <InstagramIcon className="w-3.5 h-3.5 mr-1.5" />
              Instagram
            </a>
          )}

          <Link
            href={`/customers/${customer.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 text-xs" })}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Link>

          <Link
            href={`/orders/new?customerId=${customer.id}`}
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            })}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Order
          </Link>
        </div>
      </div>

      {/* KPI Row for Client */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
        <div className="p-3 rounded-xl bg-background border border-border/70">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-primary" />
            Total Orders
          </div>
          <div className="text-xl font-bold font-heading text-foreground mt-1">
            {customer.totalOrders}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border/70">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-indigo-600" />
            Lifetime Spend
          </div>
          <div className="text-xl font-bold font-heading text-foreground mt-1">
            {formatCurrency(Number(customer.totalLifetimeValue || 0))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border/70">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            Client Since
          </div>
          <div className="text-sm font-semibold text-foreground mt-1">
            {formatDate(customer.createdAt)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border/70">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pending Balance
          </div>
          <div className="text-xl font-bold font-heading text-amber-700 mt-1">
            {formatCurrency(totalBalance)}
          </div>
        </div>
      </div>
    </div>
  );
}
