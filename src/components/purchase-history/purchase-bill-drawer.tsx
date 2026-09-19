"use client";

import React from "react";
import {
  X,
  Printer,
  Edit2,
  Trash2,
  Building2,
  Phone,
  FileText,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Receipt,
  Hash,
} from "lucide-react";
import { PurchaseBill } from "@/types/inventory";
import { Button } from "@/components/ui/button";

interface PurchaseBillDrawerProps {
  bill: PurchaseBill | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (bill: PurchaseBill) => void;
  onDelete: (billId: string) => void;
  onPrint: (bill: PurchaseBill) => void;
}

export function PurchaseBillDrawer({
  bill,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onPrint,
}: PurchaseBillDrawerProps) {
  if (!isOpen || !bill) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Invoice #{bill.invoiceNumber}
                </h2>
                {getStatusBadge(bill.status)}
              </div>
              <p className="text-xs text-slate-500">
                Purchased on {bill.invoiceDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint(bill)}
              className="text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bill)}
              className="text-slate-700 hover:text-blue-700 hover:border-blue-300"
            >
              <Edit2 className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(bill.id)}
              className="text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Total Items
              </span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                {bill.items.length} ({bill.totalQuantity} units)
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Taxable Base
              </span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">
                ₹{bill.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                GST Tax
              </span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">
                +₹{bill.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-medium text-emerald-800 block uppercase tracking-wider">
                Grand Total
              </span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                ₹{bill.grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Supplier & Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                Supplier Information
              </h3>
              <div>
                <p className="font-semibold text-slate-900 text-base">{bill.supplierName}</p>
                {bill.supplierAddress && (
                  <p className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{bill.supplierAddress}</span>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">GSTIN</span>
                  <span className="font-mono font-medium text-slate-800">
                    {bill.gstNumber || "Unregistered"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">PAN</span>
                  <span className="font-mono font-medium text-slate-800">
                    {bill.panNumber || "—"}
                  </span>
                </div>
                {bill.phoneNumber && (
                  <div className="col-span-2 flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{bill.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                Bill & Voucher Details
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" /> Invoice Number:
                  </span>
                  <span className="font-bold font-mono text-slate-800">
                    {bill.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Invoice Date:
                  </span>
                  <span className="font-semibold text-slate-800">{bill.invoiceDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Place of Supply:
                  </span>
                  <span className="font-medium text-slate-700">{bill.placeOfSupply}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700 uppercase tracking-wider">
              Purchased Line Items
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Product Name & Description</th>
                    <th className="py-2.5 px-3">HSN/SAC</th>
                    <th className="py-2.5 px-3 text-right">Tax Rate</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Taxable</th>
                    <th className="py-2.5 px-3 text-right">GST</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bill.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500">{item.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {item.hsnSac || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {item.taxRate}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ₹{item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ₹{item.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600">
                        ₹{item.taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="text-xs text-slate-500 space-y-1 max-w-sm">
                {bill.notes ? (
                  <div>
                    <span className="font-semibold text-slate-700">Notes / Remarks:</span>
                    <p className="italic text-slate-600 mt-0.5">{bill.notes}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No notes attached to this invoice.</p>
                )}
                {bill.employeeName && (
                  <div className="pt-2 text-[11px] text-slate-400">
                    Recorded by: <span className="text-slate-600">{bill.employeeName}</span>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Amount:</span>
                  <span className="font-semibold">
                    ₹{bill.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Total GST:</span>
                  <span>
                    +₹{bill.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Round Off:</span>
                  <span>
                    {bill.roundOff >= 0 ? "+" : ""}
                    ₹{bill.roundOff.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-emerald-700 text-base">
                    ₹{bill.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onPrint(bill)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
