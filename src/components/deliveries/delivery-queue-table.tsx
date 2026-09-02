"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Truck,
  PackageCheck,
  MapPin,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { updateDeliveryStatusAction } from "@/actions/delivery.actions";
import { toast } from "sonner";
import { DeliveryStatus } from "@prisma/client";

interface DeliveryItem {
  id: string;
  orderId: string;
  customerId: string;
  deliveryMethod: "CUSTOMER_PICKUP" | "LOCAL_DELIVERY" | "COURIER";
  address: string | null;
  scheduledDate: Date | string | null;
  deliveredDate: Date | string | null;
  status: DeliveryStatus;
  trackingNumber: string | null;
  courierName: string | null;
  deliveryNotes: string | null;
  createdAt: Date | string;
  order: {
    id: string;
    orderNumber: string;
    total: number | any;
    balance: number | any;
    status: string;
    expectedDeliveryDate: Date | string | null;
  };
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
  };
}

interface DeliveryQueueTableProps {
  deliveries: DeliveryItem[];
}

export function DeliveryQueueTable({ deliveries }: DeliveryQueueTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      search === "" ||
      d.order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (d.trackingNumber && d.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
      (d.courierName && d.courierName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (deliveryId: string, newStatus: DeliveryStatus) => {
    let tracking: string | undefined;
    let courier: string | undefined;

    if (newStatus === "OUT_FOR_DELIVERY") {
      tracking = window.prompt("Enter Courier Tracking Number (Optional)") || undefined;
      courier = window.prompt("Enter Courier Provider Name (e.g. Porter / BlueDart / DTDC)") || undefined;
    }

    setUpdatingId(deliveryId);
    try {
      const res = await updateDeliveryStatusAction(
        deliveryId,
        newStatus,
        tracking,
        courier
      );

      if (res.success) {
        toast.success(`Delivery status updated to ${newStatus}`);
      } else {
        toast.error(res.error || "Failed to update delivery status");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "CUSTOMER_PICKUP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            <UserCheck className="w-3 h-3" /> Boutique Pickup
          </span>
        );
      case "LOCAL_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <MapPin className="w-3 h-3" /> Local Delivery
          </span>
        );
      case "COURIER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <Truck className="w-3 h-3" /> Courier Dispatch
          </span>
        );
      default:
        return <span>{method}</span>;
    }
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Delivered
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <Truck className="w-3 h-3" /> Out for Delivery
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border/60 shadow-sm overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/20">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order #, customer, tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "SCHEDULED", "OUT_FOR_DELIVERY", "DELIVERED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {st === "ALL" ? "All Queue" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border/60">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Dispatch Method</th>
              <th className="px-4 py-3">Target Date</th>
              <th className="px-4 py-3">Courier / Tracking</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No orders found in delivery dispatch queue.
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-xs">
                    <Link
                      href={`/orders/${d.order.id}`}
                      className="text-primary hover:underline"
                    >
                      {d.order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-xs text-foreground">{d.customer.fullName}</p>
                    {d.customer.phone && (
                      <p className="text-[11px] text-muted-foreground">{d.customer.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">{getMethodBadge(d.deliveryMethod)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {d.scheduledDate ? formatDate(d.scheduledDate) : "Not Set"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {d.courierName || d.trackingNumber ? (
                      <div>
                        <p className="font-semibold text-foreground">{d.courierName || "Courier"}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {d.trackingNumber}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Direct Handover</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(d.status)}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {d.status !== "DELIVERED" ? (
                      <div className="flex items-center justify-center gap-1.5">
                        {d.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleStatusUpdate(d.id, "OUT_FOR_DELIVERY")}
                            disabled={updatingId === d.id}
                            className="px-2.5 py-1 text-xs rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 font-medium"
                          >
                            Dispatch Order
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusUpdate(d.id, "DELIVERED")}
                          disabled={updatingId === d.id}
                          className="px-2.5 py-1 text-xs rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 font-medium"
                        >
                          Mark Delivered
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
