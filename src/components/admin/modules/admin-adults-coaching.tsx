"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Users, Trophy, DollarSign, Eye, Edit2, X } from "lucide-react";
import { AdultCoachMember, ADULT_BATCHES } from "@/types/coaching-modules";
import { COACHES, Gender, StudentStatus, PaymentStatus } from "@/types/kids-coaching";
import { PaymentMethod } from "@/types/payment";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { adultsService } from "@/services/excel";
import { UniversalSearch } from "@/components/ui/universal-search";
import { universalMatch } from "@/lib/search";
import { MonthFilter } from "@/components/kids-coaching/month-filter";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentBadge } from "@/components/kids-coaching/payment-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";

const EXPORT_COLUMNS: ExportColumn<AdultCoachMember>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (_r, idx) => `#${idx + 1}` },
  { header: "Member Name", key: "memberName" },
  { header: "Mobile Number", key: "mobileNumber" },
  { header: "Age", key: "age" },
  { header: "Gender", key: "gender" },
  { header: "Batch", key: "batch" },
  { header: "Coach", key: "coach" },
  { header: "Monthly Fee", key: "monthlyFee", formatter: (r) => `₹${r.monthlyFee}` },
  { header: "Paid Amount", key: "paidAmount", formatter: (r) => `₹${r.paidAmount}` },
  { header: "Due Amount", key: "dueAmount", formatter: (r) => `₹${r.dueAmount}` },
  { header: "Payment Method", key: "paymentMethod" },
  { header: "Payment Status", key: "paymentStatus" },
  { header: "Month", key: "currentMonth", formatter: (r) => `${r.currentMonth} ${r.year}` },
  { header: "Status", key: "status" },
  { header: "Joining Date", key: "joiningDate" },
];

export function AdminAdultsCoaching() {
  const [members, setMembers] = useState<AdultCoachMember[]>(() =>
    adultsService.getSnapshot()
  );

  useEffect(() => {
    const handleUpdate = () => setMembers(adultsService.getSnapshot());
    window.addEventListener("excel-data-updated", handleUpdate);
    return () => window.removeEventListener("excel-data-updated", handleUpdate);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer & Modal states
  const [viewingMember, setViewingMember] = useState<AdultCoachMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<AdultCoachMember | null>(null);

  // Form
  const [formData, setFormData] = useState({
    memberName: "",
    mobileNumber: "",
    age: "" as unknown as number,
    gender: "Male" as Gender,
    batch: ADULT_BATCHES[0] as string,
    coach: COACHES[0] as string,
    monthlyFee: "" as unknown as number,
    paidAmount: "" as unknown as number,
    paymentMethod: "UPI" as PaymentMethod,
    joiningDate: "2026-03-01",
    status: "Active" as StudentStatus,
  });

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (searchQuery.trim() && !universalMatch(m, searchQuery)) {
        return false;
      }
      if (selectedMonth !== "All" && m.currentMonth !== selectedMonth) {
        return false;
      }
      if (m.year !== selectedYear) {
        return false;
      }
      if (paymentMethodFilter !== "all" && m.paymentMethod !== paymentMethodFilter) {
        return false;
      }
      return true;
    });
  }, [members, searchQuery, selectedMonth, selectedYear, paymentMethodFilter]);

  const selectedMembers = useMemo(() => {
    return members.filter((m) => selectedIds.includes(m.id));
  }, [members, selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedIds.includes(m.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const cur = new Set(filteredMembers.map((m) => m.id));
      setSelectedIds((prev) => prev.filter((id) => !cur.has(id)));
    } else {
      const cur = filteredMembers.map((m) => m.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...cur])));
    }
  };

  const metrics = useMemo(() => {
    const total = filteredMembers.length;
    const active = filteredMembers.filter((m) => m.status === "Active").length;
    const paid = filteredMembers.filter((m) => m.paymentStatus === "Paid").length;
    const totalDue = filteredMembers.reduce((sum, m) => sum + m.dueAmount, 0);
    return { total, active, paid, totalDue };
  }, [filteredMembers]);

  const handleOpenAdd = () => {
    setMemberToEdit(null);
    setFormData({
      memberName: "",
      mobileNumber: "",
      age: "" as unknown as number,
      gender: "Male",
      batch: ADULT_BATCHES[0],
      coach: COACHES[0],
      monthlyFee: "" as unknown as number,
      paidAmount: "" as unknown as number,
      paymentMethod: "UPI",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (m: AdultCoachMember) => {
    setMemberToEdit(m);
    setFormData({
      memberName: m.memberName,
      mobileNumber: m.mobileNumber,
      age: m.age,
      gender: m.gender,
      batch: m.batch,
      coach: m.coach,
      monthlyFee: m.monthlyFee,
      paidAmount: m.paidAmount,
      paymentMethod: m.paymentMethod || "UPI",
      joiningDate: m.joiningDate,
      status: m.status,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numFee = Number(formData.monthlyFee) || 0;
    const numPaid = Number(formData.paidAmount) || 0;
    const dueAmount = Math.max(0, numFee - numPaid);
    const paymentStatus: PaymentStatus =
      dueAmount === 0 && numPaid > 0
        ? "Paid"
        : numPaid > 0
        ? "Partial"
        : "Pending";

    if (memberToEdit) {
      await adultsService.update(
        memberToEdit.id,
        {
          ...formData,
          monthlyFee: numFee,
          paidAmount: numPaid,
          age: Number(formData.age) || 25,
          dueAmount,
          paymentStatus,
        },
        "ADM001"
      );
    } else {
      await adultsService.create(
        {
          ...formData,
          monthlyFee: numFee,
          paidAmount: numPaid,
          age: Number(formData.age) || 25,
          dueAmount,
          paymentStatus,
          currentMonth: "March",
          year: selectedYear,
        },
        {
          employeeId: "ADM001",
          employeeName: "Super Admin",
        }
      );
    }
    setMembers(adultsService.getSnapshot());
    setIsFormOpen(false);
    setMemberToEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Adults Coaching
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Trophy className="w-3.5 h-3.5" />
              <span>{filteredMembers.length} Records</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Group coaching and competitive squad training for adult players.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Adults_Coaching"
            moduleTitle="Adults Coaching Registry"
            subtitle="Facility Registry"
            columns={EXPORT_COLUMNS}
            currentViewData={filteredMembers}
            selectedData={selectedMembers}
            entireModuleData={members}
          />
          <Button
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Adult Member</span>
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Players */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Players
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Registered adult trainees
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Squad */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Squad
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 mt-1 block">
              {metrics.active}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Regular batch players
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Fees Settled */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Fees Settled
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 mt-1 block">
              {metrics.paid}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Full payments cleared
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Dues */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Pending Dues
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
              ₹{metrics.totalDue}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Awaiting fee payment
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <UniversalSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, ID, phone, or email..."
        />
        <div className="flex items-center gap-2.5 flex-wrap">
          <PaymentMethodFilter
            value={paymentMethodFilter}
            onChange={setPaymentMethodFilter}
          />
          <MonthFilter
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* Table */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No adult members found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or register a new adult trainee.</p>
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
                  <th className="px-3.5 py-3 whitespace-nowrap">Player Name</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Mobile</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Age/Gender</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Batch</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Fee</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Due</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredMembers.map((m, index) => {
                  const isChecked = selectedIds.includes(m.id);
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/80 transition-colors text-xs text-slate-700 ${
                        isChecked ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(m.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3.5 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        #{index + 1}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {m.memberName}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {m.mobileNumber}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        {m.age} yrs • {m.gender}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap max-w-[150px] truncate" title={m.batch}>
                        {m.batch}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
                        {m.coach}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ₹{m.monthlyFee}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        ₹{m.paidAmount}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                        ₹{m.dueAmount}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentMethodBadge method={m.paymentMethod} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentBadge status={m.paymentStatus} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingMember(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Player"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Player"
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
      {viewingMember && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingMember(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  {viewingMember.memberName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{viewingMember.memberName}</h2>
                  <p className="text-xs text-slate-400 font-mono">{viewingMember.memberId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Mobile:</span><span className="font-mono font-semibold text-slate-800">{viewingMember.mobileNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Age / Gender:</span><span className="font-semibold text-slate-800">{viewingMember.age}y, {viewingMember.gender}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Batch:</span><span className="font-semibold text-slate-800">{viewingMember.batch}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Coach:</span><span className="font-semibold text-slate-800">{viewingMember.coach}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Monthly Fee:</span><span className="font-semibold text-slate-800">₹{viewingMember.monthlyFee}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Paid:</span><span className="font-semibold text-emerald-600">₹{viewingMember.paidAmount}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Due:</span><span className="font-semibold text-rose-600">₹{viewingMember.dueAmount}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Payment Method:</span><PaymentMethodBadge method={viewingMember.paymentMethod} /></div>
                <div className="flex justify-between"><span className="text-slate-500">Joining Date:</span><span className="font-semibold text-slate-800">{viewingMember.joiningDate}</span></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
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
                  {memberToEdit ? "Edit Adult Member" : "Register Adult Member"}
                </h3>
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
                    <Label className="text-xs">Member Name</Label>
                    <Input
                      value={formData.memberName}
                      onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                      required
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Mobile Number</Label>
                    <Input
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      required
                      className="h-9 mt-1 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Batch</Label>
                    <select
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                    >
                      {ADULT_BATCHES.map((b: string) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Coach</Label>
                    <select
                      value={formData.coach}
                      onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                    >
                      {COACHES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Monthly Fee (₹)</Label>
                    <Input
                      type="number"
                      value={formData.monthlyFee === ("" as unknown) ? "" : formData.monthlyFee}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          monthlyFee: val === "" ? ("" as unknown as number) : Math.max(0, parseInt(val, 10) || 0),
                        });
                      }}
                      placeholder="e.g. 2000"
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Paid Amount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.paidAmount === ("" as unknown) ? "" : formData.paidAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          paidAmount: val === "" ? ("" as unknown as number) : Math.max(0, parseInt(val, 10) || 0),
                        });
                      }}
                      placeholder="e.g. 2000"
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Payment Method</Label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs bg-white"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
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
                    {memberToEdit ? "Update Player" : "Save Player"}
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
