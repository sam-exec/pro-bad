"use client";

import React, { useState, useMemo, useRef } from "react";
import { Plus, Users, Heart, DollarSign, Eye, Edit2, X, AlertCircle } from "lucide-react";
import { SuperMomsRecord } from "@/types/branch";
import { PaymentMethod, PaymentStatus } from "@/types/payment";
import { superMomsService } from "@/services/excel";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentBadge } from "@/components/kids-coaching/payment-badge";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";

interface AdminSuperMomsProps {
  selectedBranch: string; // "all" | "branch-nlg" | "branch-mnk"
}

const SUPER_MOMS_BATCHES = [
  "Morning Wellness Batch (09:00 AM - 10:30 AM)",
  "Midday Fitness Squad (11:00 AM - 12:30 PM)",
  "Evening Active Moms (04:30 PM - 06:00 PM)",
];

const EXPORT_COLUMNS: ExportColumn<SuperMomsRecord>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (r) => `#${r.serialNumber ?? ""}` },
  { header: "Member Name", key: "memberName" },
  { header: "Mobile Number", key: "mobileNumber" },
  { header: "Branch", key: "branchName", formatter: (r) => r.branchName || "Nallagandla" },
  { header: "Batch", key: "batch" },
  { header: "Coach", key: "coach" },
  { header: "Monthly Fee", key: "monthlyFee", formatter: (r) => `₹${r.monthlyFee}` },
  { header: "Amount Paid", key: "amountPaid", formatter: (r) => `₹${r.amountPaid}` },
  { header: "Due Amount", key: "dueAmount", formatter: (r) => `₹${r.dueAmount}` },
  { header: "Payment Method", key: "paymentMethod" },
  { header: "Status", key: "status" },
  { header: "Joining Date", key: "joiningDate" },
];

export function AdminSuperMoms({ selectedBranch }: AdminSuperMomsProps) {
  const [records, setRecords] = useState<SuperMomsRecord[]>(() =>
    superMomsService.getSnapshot()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer & Modal states
  const [viewingRecord, setViewingRecord] = useState<SuperMomsRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<SuperMomsRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<{
    memberName: string;
    mobileNumber: string;
    batch: string;
    coach: string;
    monthlyFee: number | "";
    amountPaid: number | "";
    paymentMethod: PaymentMethod;
    joiningDate: string;
    status: "Active" | "Inactive";
  }>({
    memberName: "",
    mobileNumber: "",
    batch: SUPER_MOMS_BATCHES[0],
    coach: "Coach Sunita Rao",
    monthlyFee: "",
    amountPaid: "",
    paymentMethod: "Cash",
    joiningDate: "2026-03-01",
    status: "Active",
  });

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedBranch !== "all" && r.branchId && r.branchId !== selectedBranch) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = r.mobileNumber.replace(/\D/g, "");
        if (!cleanPhone.includes(q)) return false;
      }
      if (selectedBatch !== "All" && r.batch !== selectedBatch) {
        return false;
      }
      if (paymentMethodFilter !== "All" && r.paymentMethod !== paymentMethodFilter) {
        return false;
      }
      return true;
    });
  }, [records, selectedBranch, searchQuery, selectedBatch, paymentMethodFilter]);

  const selectedRecords = useMemo(() => {
    return records.filter((r) => selectedIds.includes(r.id));
  }, [records, selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r) => selectedIds.includes(r.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const cur = new Set(filteredRecords.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !cur.has(id)));
    } else {
      const cur = filteredRecords.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...cur])));
    }
  };

  const metrics = useMemo(() => {
    const total = filteredRecords.length;
    const active = filteredRecords.filter((r) => r.status === "Active").length;
    const paid = filteredRecords.filter((r) => r.dueAmount === 0).length;
    const totalDue = filteredRecords.reduce((sum, r) => sum + r.dueAmount, 0);
    return { total, active, paid, totalDue };
  }, [filteredRecords]);

  const handleOpenAdd = () => {
    setRecordToEdit(null);
    setFormError(null);
    setFormData({
      memberName: "",
      mobileNumber: "",
      batch: SUPER_MOMS_BATCHES[0],
      coach: "Coach Sunita Rao",
      monthlyFee: "",
      amountPaid: "",
      paymentMethod: "Cash",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (r: SuperMomsRecord) => {
    setRecordToEdit(r);
    setFormError(null);
    setFormData({
      memberName: r.memberName,
      mobileNumber: r.mobileNumber,
      batch: r.batch,
      coach: r.coach,
      monthlyFee: r.monthlyFee,
      amountPaid: r.amountPaid,
      paymentMethod: r.paymentMethod || "Cash",
      joiningDate: r.joiningDate,
      status: r.status as "Active" | "Inactive",
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.memberName.trim()) {
      setFormError("Mother's name is required.");
      return;
    }
    const cleanPhone = formData.mobileNumber.replace(/\D/g, "");
    if (!formData.mobileNumber.trim() || cleanPhone.length !== 10) {
      setFormError("A valid 10-digit mobile number is required.");
      return;
    }

    const targetBranchId = selectedBranch !== "all" ? selectedBranch : "branch-nlg";
    const targetBranchName = targetBranchId === "branch-mnk" ? "Manikonda" : "Nallagandla";

    const fee = Number(formData.monthlyFee) || 0;
    const paid = Number(formData.amountPaid) || 0;
    const dueAmount = Math.max(0, fee - paid);
    const paymentStatus: PaymentStatus =
      paid >= fee && fee > 0 ? "Paid" : paid > 0 ? "Partial" : "Pending";
    const payload = {
      ...formData,
      monthlyFee: fee,
      amountPaid: paid,
      dueAmount,
      paymentStatus,
      paymentMethod: formData.paymentMethod || "Cash",
    };

    try {
      setIsSubmitting(true);
      if (recordToEdit) {
        await superMomsService.update(
          recordToEdit.id,
          payload,
          "ADM001"
        );
      } else {
        await superMomsService.create(
          payload,
          {
            branchId: targetBranchId,
            branchName: targetBranchName,
            employeeId: "ADM001",
            employeeName: "Super Admin",
          }
        );
      }
      setRecords(superMomsService.getSnapshot());
      setIsFormOpen(false);
      setRecordToEdit(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save Super Mom. Please try again.";
      setFormError(msg);
      if (formRef.current) {
        formRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Super Moms Badminton
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <Heart className="w-3.5 h-3.5" />
              <span>{filteredRecords.length} Mothers Enrolled</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Specialized daytime badminton, fitness, and wellness batches for homemakers & mothers.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Super_Moms"
            moduleTitle="Super Moms Badminton Registry"
            subtitle={`Branch: ${selectedBranch === "all" ? "All Branches" : selectedBranch}`}
            columns={EXPORT_COLUMNS}
            currentViewData={filteredRecords}
            selectedData={selectedRecords}
            entireModuleData={records}
          />
          <Button
            onClick={handleOpenAdd}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Super Mom</span>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Moms</p>
              <h3 className="text-xl font-bold text-slate-900">{metrics.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Players</p>
              <h3 className="text-xl font-bold text-emerald-600">{metrics.active}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Fees Settled</p>
              <h3 className="text-xl font-bold text-purple-600">{metrics.paid}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending Dues</p>
              <h3 className="text-xl font-bold text-amber-600">₹{metrics.totalDue}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by mobile number..."
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Batch:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <option value="All">All Batches</option>
              {SUPER_MOMS_BATCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <PaymentMethodFilter
            value={paymentMethodFilter}
            onChange={setPaymentMethodFilter}
          />
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Super Moms found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or register a new Super Mom trainee.</p>
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
                  <th className="px-3.5 py-3 whitespace-nowrap">Serial No</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Mother Name</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Mobile Number</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Branch</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Batch</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Monthly Fee</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Due</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredRecords.map((r) => {
                  const isChecked = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 transition-colors text-xs text-slate-700 ${
                        isChecked ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(r.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3.5 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        #{r.serialNumber}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {r.memberName}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {r.mobileNumber}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {r.branchName || "Nallagandla"}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap max-w-[170px] truncate" title={r.batch}>
                        {r.batch}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
                        {r.coach}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ₹{r.monthlyFee}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        ₹{r.amountPaid}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                        ₹{r.dueAmount}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentMethodBadge method={r.paymentMethod} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={r.status as any} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                        {r.joiningDate}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingRecord(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer */}
      {viewingRecord && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingRecord(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                  {viewingRecord.memberName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{viewingRecord.memberName}</h2>
                  <p className="text-xs text-slate-400 font-mono">{viewingRecord.memberId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Mobile:</span><span className="font-mono font-semibold text-slate-800">{viewingRecord.mobileNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Branch:</span><span className="font-semibold text-slate-800">{viewingRecord.branchName || "Nallagandla"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Batch:</span><span className="font-semibold text-slate-800">{viewingRecord.batch}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Coach:</span><span className="font-semibold text-slate-800">{viewingRecord.coach}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Monthly Fee:</span><span className="font-semibold text-slate-800">₹{viewingRecord.monthlyFee}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Paid:</span><span className="font-semibold text-emerald-600">₹{viewingRecord.amountPaid}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Due:</span><span className="font-semibold text-rose-600">₹{viewingRecord.dueAmount}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Payment Method:</span><PaymentMethodBadge method={viewingRecord.paymentMethod} /></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Payment Status:</span><span className={`px-2 py-0.5 rounded text-xs font-semibold ${viewingRecord.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : viewingRecord.paymentStatus === "Partial" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>{viewingRecord.paymentStatus || (viewingRecord.dueAmount === 0 ? "Paid" : "Partial")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Joining Date:</span><span className="font-semibold text-slate-800">{viewingRecord.joiningDate}</span></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Form Modal */}
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
                <h3 className="text-lg font-bold text-slate-900">
                  {recordToEdit ? "Edit Super Mom" : "Register Super Mom"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form ref={formRef} noValidate onSubmit={handleSave} className="space-y-3.5 text-xs">
                <div>
                  <Label className="text-xs">Mother's Name</Label>
                  <Input
                    value={formData.memberName}
                    onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Mobile Number</Label>
                    <Input
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      required
                      className="h-9 mt-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Coach</Label>
                    <Input
                      value={formData.coach}
                      onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Batch</Label>
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                  >
                    {SUPER_MOMS_BATCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Monthly Fee (₹)</Label>
                    <Input
                      type="number"
                      value={formData.monthlyFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthlyFee:
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Paid Amount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.amountPaid}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amountPaid:
                            e.target.value === ""
                              ? ""
                              : Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      Payment Method {Number(formData.amountPaid) > 0 && <span className="text-red-500">*</span>}
                    </Label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs bg-white"
                      required={Number(formData.amountPaid) > 0}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="h-9 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {isSubmitting ? "Saving..." : recordToEdit ? "Update Super Mom" : "Save Super Mom"}
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
