"use client";

import React from "react";
import { InvoiceDetails } from "@/types/products";
import {
  CheckCircle2,
  Printer,
  Download,
  X,
  Building,
  User,
  Phone,
  Calendar,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceModalProps {
  invoice: InvoiceDetails | null;
  onClose: () => void;
}

export function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold">Sale Completed &amp; Invoiced</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Card */}
        <div id="printable-invoice" className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  PB
                </div>
                <span className="text-base font-black tracking-tight text-slate-900">
                  PRO BADMINTON ACADEMY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {invoice.branchName} Branch • Enterprise Sports Retail
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tax Invoice
              </span>
              <span className="font-mono text-sm font-extrabold text-slate-900 block">
                {invoice.invoiceNumber}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {new Date(invoice.saleDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Customer & Transaction Info */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To:
              </span>
              <p className="font-bold text-slate-900">{invoice.customerName}</p>
              <p className="text-slate-600 mt-0.5">{invoice.customerMobile}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Payment Details:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Paid via {invoice.paymentMethod}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Processed by: {invoice.employeeName}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Item &amp; Variant</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 text-xs">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-slate-600 font-semibold">
                        {item.modelName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        SKU: {item.sku} •{" "}
                        {Object.entries(item.attributes)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{(item.unitPrice * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied</span>
                <span className="font-mono">-₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>GST (18%)</span>
                <span className="font-mono">+₹{invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total Paid</span>
              <span className="text-emerald-700 font-mono">
                ₹{invoice.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">
              Thank you for playing with Pro Badminton Academy! Please keep this receipt for warranty and stringing records.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
