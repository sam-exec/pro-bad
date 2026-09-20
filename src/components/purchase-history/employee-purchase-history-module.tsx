"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Truck,
  IndianRupee,
  FileCheck2,
  FileSpreadsheet,
  Plus,
  Filter,
  Eye,
  Printer,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { PurchaseBill } from "@/types/inventory";
import { purchaseHistoryService } from "@/services/purchaseHistoryService";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { UniversalSearch } from "@/components/ui/universal-search";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";
import { PurchaseBillModal } from "@/components/purchase-history/purchase-bill-modal";
import { PurchaseBillDrawer } from "@/components/purchase-history/purchase-bill-drawer";
import { PurchaseBillPrint } from "@/components/purchase-history/purchase-bill-print";

const purchaseExportColumns: ExportColumn<PurchaseBill>[] = [
  { header: "Invoice #", key: "invoiceNumber" },
  { header: "Invoice Date", key: "invoiceDate" },
  { header: "Supplier Name", key: "supplierName" },
  { header: "GST Number", key: "gstNumber" },
  { header: "Total Qty", key: "totalQuantity" },
  {
    header: "Taxable Amount (₹)",
    key: "taxableAmount",
    formatter: (r) => `₹${r.taxableAmount.toFixed(2)}`,
  },
  {
    header: "GST Amount (₹)",
    key: "gstAmount",
    formatter: (r) => `₹${r.gstAmount.toFixed(2)}`,
  },
  {
    header: "Round Off (₹)",
    key: "roundOff",
    formatter: (r) => `₹${r.roundOff.toFixed(2)}`,
  },
  {
    header: "Grand Total (₹)",
    key: "grandTotal",
    formatter: (r) => `₹${r.grandTotal.toFixed(2)}`,
  },
  { header: "Status", key: "status" },
  { header: "Employee", key: "employeeName" },
];

export function EmployeePurchaseHistoryModule() {
  const { employeeId, employeeName } = useAuth();
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Filters
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBillForDrawer, setSelectedBillForDrawer] = useState<PurchaseBill | null>(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<PurchaseBill | null>(null);

  // Subscribe
  useEffect(() => {
    const unsub = purchaseHistoryService.subscribe(() => {
      setUpdateTrigger((t) => t + 1);
    });
    return () => unsub();
  }, []);

  // Filtered bills
  const filteredBills = useMemo(() => {
    return purchaseHistoryService.getBills({
      dateFilter,
      startDate,
      endDate,
      status: statusFilter,
      searchQuery,
    });
  }, [dateFilter, startDate, endDate, statusFilter, searchQuery, updateTrigger]);

  // Summary
  const summary = useMemo(() => {
    return purchaseHistoryService.getSummary();
  }, [updateTrigger]);

  const handleSaveBill = (billData: any) => {
    purchaseHistoryService.createBill({
      ...billData,
      employeeId,
      employeeName,
    });
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3" /> Verified
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Purchase History
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{summary.totalBills} Bills</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Log supplier invoices, record stock intake, and view procurement invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportDropdown
            moduleName="Purchase_History"
            moduleTitle="Purchase History Registry"
            subtitle="Facility Registry"
            columns={purchaseExportColumns}
            currentViewData={filteredBills}
            selectedData={[]}
            entireModuleData={purchaseHistoryService.getBills()}
          />
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Purchase Bill
          </Button>
        </div>
      </div>




      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <UniversalSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search invoice #, supplier name, item..."
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-500">Period:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Dates</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {(dateFilter !== "all" || statusFilter !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 h-8"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {dateFilter === "custom" && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
            />
            <span className="text-slate-500 font-semibold">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice # &amp; Date</th>
                <th className="py-3 px-3">Supplier Name &amp; GSTIN</th>
                <th className="py-3 px-3 text-center">Items &amp; Qty</th>
                <th className="py-3 px-3 text-right">Taxable (₹)</th>
                <th className="py-3 px-3 text-right">GST (₹)</th>
                <th className="py-3 px-3 text-right">Grand Total (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No purchase bills found.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedBillForDrawer(bill)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono text-sm">
                        #{bill.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{bill.invoiceDate}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{bill.supplierName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {bill.gstNumber || "No GSTIN"}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-slate-800">{bill.items.length} items</span>
                      <span className="text-[11px] text-slate-400 block">({bill.totalQuantity} units)</span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{bill.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-emerald-600 font-medium">
                      +₹{bill.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-sm">
                      ₹{bill.grandTotal.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3 px-3 text-center">{getStatusBadge(bill.status)}</td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Invoice"
                          onClick={() => setSelectedBillForDrawer(bill)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Print Invoice"
                          onClick={() => setSelectedBillForPrint(bill)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {filteredBills.length} purchase vouchers in facility register</span>
          <span>Stock updates reflect immediately in Inventory</span>
        </div>
      </div>

      {/* Modals & Print */}
      <PurchaseBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBill}
        isAdmin={false}
      />

      <PurchaseBillDrawer
        bill={selectedBillForDrawer}
        isOpen={!!selectedBillForDrawer}
        onClose={() => setSelectedBillForDrawer(null)}
        onEdit={() => {}}
        onDelete={() => {}}
        onPrint={(bill) => setSelectedBillForPrint(bill)}
      />

      <PurchaseBillPrint
        bill={selectedBillForPrint}
        isOpen={!!selectedBillForPrint}
        onClose={() => setSelectedBillForPrint(null)}
      />
    </div>
  );
}

export default EmployeePurchaseHistoryModule;
