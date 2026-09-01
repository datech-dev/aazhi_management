import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Phone,
  MessageSquare,
  Eye,
  Plus,
  Scissors,
  MapPin,
} from "lucide-react";
import { InstagramIcon } from "@/components/shared/icons";
import { buttonVariants } from "@/components/ui/button";

interface CustomerWithDetails {
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
  tags: {
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }[];
  addresses: {
    city: string;
    state: string | null;
  }[];
  _count: {
    orders: number;
    measurementProfiles: number;
  };
}

interface CustomerListTableProps {
  customers: CustomerWithDetails[];
}

export function CustomerListTable({ customers }: CustomerListTableProps) {
  if (customers.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Scissors className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold font-heading text-foreground">
          No clients found
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          No boutique customer profiles match the current filter or search criteria.
        </p>
        <div className="mt-4">
          <Link
            href="/customers/new"
            className={buttonVariants({
              variant: "default",
              className: "bg-primary text-primary-foreground hover:bg-primary/90",
            })}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register New Client
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 px-4 font-semibold">Client</th>
              <th className="py-3 px-4 font-semibold">Contact & Social</th>
              <th className="py-3 px-4 font-semibold">Location</th>
              <th className="py-3 px-4 font-semibold">Tags</th>
              <th className="py-3 px-4 font-semibold text-center">Orders</th>
              <th className="py-3 px-4 font-semibold text-right">Lifetime Spend</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {customers.map((customer) => {
              const defaultAddr = customer.addresses[0];
              const whatsappClean = customer.whatsappNumber?.replace(/[^0-9]/g, "") || customer.phone?.replace(/[^0-9]/g, "");
              const formattedWA = whatsappClean && !whatsappClean.startsWith("91") && whatsappClean.length === 10
                ? `91${whatsappClean}`
                : whatsappClean;

              const cleanInsta = customer.instagramUsername?.replace(/^@/, "");

              return (
                <tr
                  key={customer.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Client Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-sm font-heading border border-primary/20">
                        {customer.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          {customer.fullName}
                        </Link>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{customer.source.toLowerCase().replace("_", " ")}</span>
                          {customer._count.measurementProfiles > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-primary font-medium">
                                {customer._count.measurementProfiles} measurement profile(s)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Shortcuts */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {customer.phone && (
                        <a
                          href={`tel:${customer.phone}`}
                          className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                          title={`Call ${customer.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {formattedWA && (
                        <a
                          href={`https://wa.me/${formattedWA}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                          title={`Chat on WhatsApp (${customer.whatsappNumber || customer.phone})`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {cleanInsta && (
                        <a
                          href={`https://instagram.com/${cleanInsta}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 rounded-md bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition-colors"
                          title={`View Instagram Profile (@${cleanInsta})`}
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <span className="text-xs text-muted-foreground ml-1">
                        {customer.phone || customer.email || "No direct phone"}
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {defaultAddr ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        {defaultAddr.city}
                        {defaultAddr.state ? `, ${defaultAddr.state}` : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>

                  {/* Tags */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {customer.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      ) : (
                        customer.tags.map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${tag.color}15`,
                              color: tag.color,
                              borderColor: `${tag.color}40`,
                              borderWidth: "1px",
                            }}
                          >
                            {tag.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  {/* Orders count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-semibold text-foreground">
                      {customer.totalOrders || customer._count.orders}
                    </span>
                  </td>

                  {/* Lifetime Value */}
                  <td className="py-3.5 px-4 text-right font-semibold font-heading text-foreground">
                    {formatCurrency(Number(customer.totalLifetimeValue || 0))}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/customers/${customer.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                          className: "h-8 px-2.5 text-xs",
                        })}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Profile
                      </Link>
                      <Link
                        href={`/orders/new?customerId=${customer.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "h-8 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10",
                        })}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Order
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
