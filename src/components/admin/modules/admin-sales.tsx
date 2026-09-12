"use client";

import React, { useState, useMemo } from "react";
import {
  CircleDollarSign,
  Plus,
  Receipt,
  Eye,
  CreditCard,
  Building2,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";
import { SalesRecord } from "@/types/branch";
import { salesService } from "@/services/excel";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";

interface AdminSalesProps {
  selectedBranch: string; // "all" | "branch-nlg" | "branch-mnk"
}

const CATEGORIES = ["All", "Coaching", "Membership", "Court Booking", "Merchandise"];

const EXPORT_COLUMNS: ExportColumn<SalesRecord>[] = [
  { header: "Invoice #", key: "invoiceNumber" },
  { header: "Customer Name", key: "customerName" },
  { header: "Customer Mobile", key: "customerMobile" },
  { header: "Category", key: "category" },
  { header: "Description", key: "description" },
  { header: "Amount", key: "amount", formatter: (r) => `₹${r.amount}` },
  { header: "Payment Method", key: "paymentMethod" },
  { header: "Branch", key: "branchName", formatter: (r) => r.branchName || "Nallagandla" },
  { header: "Handled By", key: "employeeName", formatter: (r) => `${r.employeeName} (${r.employeeId})` },
  { header: "Date", key: "date" },
];

export function AdminSales({ selectedBranch }: AdminSalesProps) {
  const [sales, setSales] = useState<SalesRecord[]>(() => salesService.getSnapshot());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer & Modal
  const [viewingSale, setViewingSale] = useState<SalesRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerMobile: "",
    category: "Coaching",
    description: "",
    amount: 150,
    paymentMethod: "UPI",
    date: "2026-03-08",
  });

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (selectedBranch !== "all" && s.branchId && s.branchId !== selectedBranch) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchCustomer = s.customerName.toLowerCase().includes(q);
        const matchInvoice = s.invoiceNumber.toLowerCase().includes(q);
        const matchPhone = s.customerMobile.includes(q);
        if (!matchCustomer && !matchInvoice && !matchPhone) return false;
      }
      if (selectedCategory !== "All" && s.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [sales, selectedBranch, searchQuery, selectedCategory]);

  const selectedSales = useMemo(() => {
    return sales.filter((s) => selectedIds.includes(s.id));
  }, [sales, selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredSales.length > 0 &&
    filteredSales.every((s) => selectedIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const cur = new Set(filteredSales.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !cur.has(id)));
    } else {
      const cur = filteredSales.map((s) => s.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...cur])));
    }
  };

  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.amount, 0);
    const count = filteredSales.length;
    const avgTicket = count > 0 ? Math.round(totalRevenue / count) : 0;
    return { totalRevenue, count, avgTicket };
  }, [filteredSales]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBranchId = selectedBranch !== "all" ? selectedBranch : "branch-nlg";
    const targetBranchName = targetBranchId === "branch-mnk" ? "Manikonda" : "Nallagandla";

    salesService.create(formData as any, {
      branchId: targetBranchId,
      branchName: targetBranchName,
      employeeId: "ADM001",
      employeeName: "Super Admin",
    });

    setSales(salesService.getSnapshot());
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sales & Invoicing
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CircleDollarSign className="w-3.5 h-3.5" />
              <span>{filteredSales.length} Transactions</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise point-of-sale register, fee receipts, court bookings, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Sales"
            moduleTitle="Sales & Invoicing Registry"
            subtitle={`Branch: ${selectedBranch === "all" ? "All Branches" : selectedBranch}`}
            columns={EXPORT_COLUMNS}
            currentViewData={filteredSales}
            selectedData={selectedSales}
            entireModuleData={sales}
          />
          <Button
            onClick={() => {
              setFormData({
                customerName: "",
                customerMobile: "",
                category: "Coaching",
                description: "",
                amount: 150,
                paymentMethod: "UPI",
                date: new Date().toISOString().split("T")[0],
              });
              setIsFormOpen(true);
            }}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Filtered Sales Total</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">₹{metrics.totalRevenue}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Invoices Issued</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{metrics.count}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Average Ticket Size</p>
              <h3 className="text-2xl font-extrabold text-purple-600">₹{metrics.avgTicket}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by customer, phone, or invoice #..."
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredSales.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No transactions found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or create a new invoice transaction.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-320px)] scrollbar-thin">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
                <tr>
                  <th className="px-3.5 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Invoice #</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Date</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Customer Name</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Mobile</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Branch</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Category</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Description</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Amount</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Method</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Operator</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredSales.map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors text-xs text-slate-700 ${
                        isChecked ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(s.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3.5 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {s.invoiceNumber}
                      </td>
                      <td className="px-3.5 py-3 text-slate-500 whitespace-nowrap">
                        {s.date}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {s.customerName}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {s.customerMobile}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {s.branchName || "Nallagandla"}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 max-w-[200px] truncate text-slate-600" title={s.description}>
                        {s.description}
                      </td>
                      <td className="px-3.5 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{s.amount}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {s.paymentMethod}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {s.employeeId}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => setViewingSale(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Drawer */}
      {viewingSale && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingSale(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{viewingSale.invoiceNumber}</h2>
                  <p className="text-xs text-slate-400">{viewingSale.date}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingSale(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex justify-between"><span className="text-slate-500">Customer:</span><span className="font-semibold text-slate-800">{viewingSale.customerName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mobile:</span><span className="font-mono font-semibold text-slate-800">{viewingSale.customerMobile}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Branch:</span><span className="font-semibold text-slate-800">{viewingSale.branchName || "Nallagandla"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-semibold text-slate-800">{viewingSale.category}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Description:</span><span className="font-medium text-slate-700 text-right max-w-[200px]">{viewingSale.description}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Payment Method:</span><span className="font-semibold text-slate-800">{viewingSale.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Handled By:</span><span className="font-semibold text-slate-800">{viewingSale.employeeName} ({viewingSale.employeeId})</span></div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Total Billed:</span>
                  <span className="font-extrabold text-emerald-600">₹{viewingSale.amount}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Invoice Modal */}
      {isFormOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFormOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Create New Invoice</h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Customer Name</Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Customer Mobile</Label>
                    <Input
                      value={formData.customerMobile}
                      onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                      required
                      className="h-9 mt-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Category</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                    >
                      <option value="Coaching">Coaching</option>
                      <option value="Membership">Membership</option>
                      <option value="Court Booking">Court Booking</option>
                      <option value="Merchandise">Merchandise</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Payment Method</Label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                    >
                      <option value="UPI">UPI</option>
                      <option value="NetBanking">NetBanking</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="e.g. Court 2 Weekend Slot (2 Hours)"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Billed Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                    Issue Invoice
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
