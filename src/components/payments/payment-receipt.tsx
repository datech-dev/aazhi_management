"use client";

import { Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PaymentReceiptProps {
  payment: {
    id: string;
    paymentNumber: string;
    amount: number | any;
    method: string;
    type: string;
    referenceNumber: string | null;
    notes: string | null;
    createdAt: Date | string;
    order: {
      id: string;
      orderNumber: string;
      orderDate: Date | string;
      expectedDeliveryDate: Date | string | null;
      subtotal: number | any;
      taxAmount: number | any;
      discountAmount: number | any;
      total: number | any;
      advancePaid: number | any;
      balance: number | any;
      status: string;
      paymentStatus: string;
      items: Array<{
        id: string;
        description: string;
        quantity: number;
        unitPrice: number | any;
        totalPrice: number | any;
        customizations: string | null;
      }>;
    };
    customer: {
      fullName: string;
      phone: string | null;
      whatsappNumber: string | null;
      email: string | null;
      addresses?: Array<{
        line1: string;
        city: string;
        pincode: string;
      }>;
    };
    recordedBy: {
      name: string;
    };
  };
}

export function PaymentReceipt({ payment }: PaymentReceiptProps) {
  const { order, customer } = payment;
  const address = customer.addresses?.[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="print:hidden flex items-center justify-between mb-6">
        <Link
          href="/payments"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payments Ledger
        </Link>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-white text-black p-8 rounded-xl border border-gray-200 shadow-md print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-900 text-white flex items-center justify-center font-serif font-bold text-lg">
                A
              </div>
              <h1 className="text-2xl font-bold font-serif text-amber-950 tracking-tight">
                Aazhi Designer Studio
              </h1>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Boutique Fashion & Custom Tailoring Studio
            </p>
            <p className="text-xs text-gray-500">
              WhatsApp / Call: +91 98765 43210 • Instagram: @aazhi_designer
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-full uppercase tracking-wider mb-2">
              Payment Receipt
            </span>
            <p className="text-xs font-mono font-bold text-gray-900">
              Receipt #: {payment.paymentNumber}
            </p>
            <p className="text-xs text-gray-500">Date: {formatDate(payment.createdAt)}</p>
          </div>
        </div>

        {/* Client & Order Overview */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
          <div>
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] text-gray-500 mb-1">
              Billed To
            </h3>
            <p className="font-semibold text-sm text-gray-900">{customer.fullName}</p>
            {customer.phone && <p className="text-gray-600">Phone: {customer.phone}</p>}
            {address && (
              <p className="text-gray-600">
                {address.line1}, {address.city} - {address.pincode}
              </p>
            )}
          </div>

          <div className="text-right">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[10px] text-gray-500 mb-1">
              Order Information
            </h3>
            <p className="font-mono font-bold text-sm text-amber-900">
              Order #: {order.orderNumber}
            </p>
            <p className="text-gray-600">Order Date: {formatDate(order.orderDate)}</p>
            {order.expectedDeliveryDate && (
              <p className="text-gray-600">
                Target Delivery: {formatDate(order.expectedDeliveryDate)}
              </p>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="mb-6 overflow-hidden rounded border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-3 py-2">Garment Item / Description</th>
                <th className="px-3 py-2 text-center">Qty</th>
                <th className="px-3 py-2 text-right">Unit Price (₹)</th>
                <th className="px-3 py-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 font-medium">
                    {item.description}
                    {item.customizations && (
                      <p className="text-[11px] text-gray-500 italic">
                        Notes: {item.customizations}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {formatCurrency(Number(item.totalPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Payment Mode */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-xs border-t border-gray-200 pt-4">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Payment Details</h4>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid Now:</span>
                <span className="font-bold text-emerald-800">
                  {formatCurrency(Number(payment.amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="font-semibold text-gray-900">{payment.method}</span>
              </div>
              {payment.referenceNumber && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-500">Ref / Txn ID:</span>
                  <span className="font-mono text-gray-700">{payment.referenceNumber}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Recorded By:</span>
                <span className="text-gray-700">{payment.recordedBy.name}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-right">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatCurrency(Number(order.subtotal))}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-{formatCurrency(Number(order.discountAmount))}</span>
              </div>
            )}
            {Number(order.taxAmount) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>GST / Tax:</span>
                <span>+{formatCurrency(Number(order.taxAmount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-gray-900 border-t border-gray-200 pt-1.5">
              <span>Grand Total:</span>
              <span>{formatCurrency(Number(order.total))}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Total Paid to Date:</span>
              <span>{formatCurrency(Number(order.advancePaid))}</span>
            </div>
            <div className="flex justify-between font-bold text-amber-800 text-xs border-t border-dashed border-gray-300 pt-1">
              <span>Balance Remaining:</span>
              <span>{formatCurrency(Number(order.balance))}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-4 text-[10px] text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">
            Thank you for choosing Aazhi Designer Studio!
          </p>
          <p>
            Please present this receipt at the time of delivery pickup. Standard alterative
            revisions are valid within 7 days of delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
