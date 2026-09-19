"use client";

import React, { useRef } from "react";
import { X, Printer, Download } from "lucide-react";
import { PurchaseBill } from "@/types/inventory";
import { Button } from "@/components/ui/button";

interface PurchaseBillPrintProps {
  bill: PurchaseBill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseBillPrint({
  bill,
  isOpen,
  onClose,
}: PurchaseBillPrintProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none print:w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Purchase Voucher Preview</span>
            <span className="text-xs text-slate-400">#{bill.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print / Save as PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div
          ref={printAreaRef}
          className="p-8 sm:p-12 overflow-y-auto text-slate-800 print:p-8 print:overflow-visible font-sans bg-white"
        >
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-invoice-content,
              #printable-invoice-content * {
                visibility: visible;
              }
              #printable-invoice-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
            }
          `}</style>

          <div id="printable-invoice-content" className="space-y-6">
            {/* Header / Brand */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  PRO BADMINTON ACADEMY
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Center of Excellence for Badminton Training & Retail Shop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Place of Supply: <strong className="text-slate-800">{bill.placeOfSupply}</strong>
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-bold text-sm tracking-wider uppercase border border-slate-300 rounded">
                  Purchase Voucher
                </div>
                <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                  <p>
                    <span className="font-semibold text-slate-700">Bill No:</span>{" "}
                    <span className="font-mono font-bold text-slate-900">{bill.invoiceNumber}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Date:</span> {bill.invoiceDate}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Status:</span> {bill.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Parties Info Grid */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                  Supplier / Vendor:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-1">{bill.supplierName}</p>
                {bill.supplierAddress && (
                  <p className="text-slate-600 mt-0.5 whitespace-pre-line">{bill.supplierAddress}</p>
                )}
                <div className="mt-2 space-y-0.5 font-mono text-[11px] text-slate-700">
                  {bill.gstNumber && (
                    <p>
                      <span className="font-sans font-semibold text-slate-500">GSTIN:</span>{" "}
                      {bill.gstNumber}
                    </p>
                  )}
                  {bill.panNumber && (
                    <p>
                      <span className="font-sans font-semibold text-slate-500">PAN:</span>{" "}
                      {bill.panNumber}
                    </p>
                  )}
                  {bill.phoneNumber && (
                    <p>
                      <span className="font-sans font-semibold text-slate-500">Phone:</span>{" "}
                      {bill.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                  Billed To / Delivered At:
                </span>
                <p className="font-bold text-slate-900 text-sm mt-1">PRO Badminton Academy</p>
                <p className="text-slate-600 mt-0.5">Main Facility</p>
                <p className="text-slate-600">Telangana, India</p>
                <div className="mt-2 space-y-0.5 text-[11px] text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-500">Recorded By:</span>{" "}
                    {bill.employeeName || "Admin Executive"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">Entry Timestamp:</span>{" "}
                    {new Date(bill.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                    <th className="py-2.5 px-3 text-right">Tax%</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Taxable</th>
                    <th className="py-2.5 px-3 text-right">GST</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bill.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500">{item.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                        {item.hsnSac || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{item.taxRate}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ₹{item.rate.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ₹{item.taxableAmount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        ₹{item.taxAmount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations and Notes */}
            <div className="flex justify-between items-start pt-2 gap-8 text-xs">
              <div className="flex-1 space-y-3">
                {bill.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block">Remarks / Notes:</span>
                    <p className="text-slate-600 mt-0.5">{bill.notes}</p>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-600">Declaration:</p>
                  <p>
                    We declare that this invoice shows the actual price of the goods described and
                    that all particulars are true and correct.
                  </p>
                </div>
              </div>

              <div className="w-72 space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between text-slate-600">
                  <span>Total Quantity:</span>
                  <span className="font-bold text-slate-900">{bill.totalQuantity} units</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Base:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{bill.taxableAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Amount:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{bill.gstAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Round Off:</span>
                  <span>{bill.roundOff >= 0 ? `+₹${bill.roundOff.toFixed(2)}` : `-₹${Math.abs(bill.roundOff).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-base text-emerald-700">
                    ₹{bill.grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-12 text-xs">
              <div className="border-t border-slate-300 pt-2 text-center text-slate-500">
                Supplier Authorized Signature
              </div>
              <div className="border-t border-slate-300 pt-2 text-center text-slate-700 font-medium">
                For PRO Badminton Academy (Authorized Signatory)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
