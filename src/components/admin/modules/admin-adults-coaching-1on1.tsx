"use client";

import React, { useState, useMemo, useRef } from "react";
import { Plus, Users, Medal, DollarSign, Calendar, Eye, Edit2, X, AlertCircle } from "lucide-react";
import { Adult1on1Member, SESSION_PACKAGES, TIMING_SLOTS_1ON1 } from "@/types/coaching-modules";
import { COACHES, Gender, StudentStatus, PaymentStatus } from "@/types/kids-coaching";
import { PaymentMethod } from "@/types/payment";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { adultsService } from "@/services/excel";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { MonthFilter } from "@/components/kids-coaching/month-filter";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentBadge } from "@/components/kids-coaching/payment-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";

interface AdminAdultsCoaching1on1Props {
  selectedBranch: string; // "all" | "branch-nlg" | "branch-mnk"
}

const EXPORT_COLUMNS: ExportColumn<Adult1on1Member>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (r) => `#${r.serialNumber ?? ""}` },
  { header: "Member Name", key: "memberName" },
  { header: "Mobile", key: "mobileNumber" },
  { header: "Age", key: "age" },
  { header: "Gender", key: "gender" },
  { header: "Branch", key: "branchName", formatter: (r) => r.branchName || "Nallagandla" },
  { header: "Coach", key: "coach" },
  { header: "Timing Slot", key: "preferredTiming" },
  { header: "Session Package", key: "sessionPackage" },
  { header: "Completed Sessions", key: "sessionsCompleted" },
  { header: "Remaining Sessions", key: "sessionsRemaining" },
  { header: "Total Fee", key: "feeAmount", formatter: (r) => `₹${r.feeAmount}` },
  { header: "Amount Paid", key: "paidAmount", formatter: (r) => `₹${r.paidAmount}` },
  { header: "Due Amount", key: "dueAmount", formatter: (r) => `₹${r.dueAmount}` },
  { header: "Payment Method", key: "paymentMethod" },
  { header: "Payment Status", key: "paymentStatus" },
  { header: "Status", key: "status" },
  { header: "Joining Date", key: "joiningDate" },
];

export function AdminAdultsCoaching1on1({ selectedBranch }: AdminAdultsCoaching1on1Props) {
  const [members, setMembers] = useState<Adult1on1Member[]>(() =>
    adultsService.getSnapshot1on1()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer & Modal
  const [viewingMember, setViewingMember] = useState<Adult1on1Member | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Adult1on1Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<{
    memberName: string;
    mobileNumber: string;
    age: number | "";
    gender: Gender;
    coach: string;
    preferredTiming: string;
    sessionPackage: string;
    totalSessions: number | "";
    feeAmount: number | "";
    paidAmount: number | "";
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    joiningDate: string;
    status: StudentStatus;
  }>({
    memberName: "",
    mobileNumber: "",
    age: "",
    gender: "Male",
    coach: COACHES[0],
    preferredTiming: TIMING_SLOTS_1ON1[0],
    sessionPackage: SESSION_PACKAGES[0],
    totalSessions: 12,
    feeAmount: "",
    paidAmount: "",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    joiningDate: "2026-03-01",
    status: "Active",
  });

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (selectedBranch !== "all" && m.branchId && m.branchId !== selectedBranch) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = m.mobileNumber.replace(/\D/g, "");
        if (!cleanPhone.includes(q)) return false;
      }
      if (selectedMonth !== "All" && m.month !== selectedMonth) {
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
  }, [members, selectedBranch, searchQuery, selectedMonth, selectedYear, paymentMethodFilter]);

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
    const totalDue = filteredMembers.reduce((sum, m) => sum + m.dueAmount, 0);
    const sessions = filteredMembers.reduce((sum, m) => sum + m.sessionsCompleted, 0);
    return { total, active, totalDue, sessions };
  }, [filteredMembers]);

  const handleOpenAdd = () => {
    setMemberToEdit(null);
    setFormError(null);
    setFormData({
      memberName: "",
      mobileNumber: "",
      age: "",
      gender: "Male",
      coach: COACHES[0],
      preferredTiming: TIMING_SLOTS_1ON1[0],
      sessionPackage: SESSION_PACKAGES[0],
      totalSessions: 12,
      feeAmount: "",
      paidAmount: "",
      paymentStatus: "Paid",
      paymentMethod: "UPI",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (m: Adult1on1Member) => {
    setMemberToEdit(m);
    setFormError(null);
    setFormData({
      memberName: m.memberName,
      mobileNumber: m.mobileNumber,
      age: m.age,
      gender: m.gender,
      coach: m.coach,
      preferredTiming: m.preferredTiming,
      sessionPackage: m.sessionPackage,
      totalSessions: m.totalSessions,
      feeAmount: m.feeAmount,
      paidAmount: m.paidAmount,
      paymentStatus: m.paymentStatus,
      paymentMethod: m.paymentMethod || "UPI",
      joiningDate: m.joiningDate,
      status: m.status,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.memberName.trim()) {
      setFormError("Player name is required.");
      return;
    }
    const cleanPhone = formData.mobileNumber.replace(/\D/g, "");
    if (!formData.mobileNumber.trim() || cleanPhone.length !== 10) {
      setFormError("A valid 10-digit mobile number is required.");
      return;
    }

    const targetBranchId = selectedBranch !== "all" ? selectedBranch : "branch-nlg";
    const targetBranchName = targetBranchId === "branch-mnk" ? "Manikonda" : "Nallagandla";
    const fee = Number(formData.feeAmount) || 0;
    const paid = Number(formData.paidAmount) || 0;
    const dueAmount = Math.max(0, fee - paid);
    const paymentStatus: PaymentStatus =
      dueAmount === 0 && paid > 0
        ? "Paid"
        : paid > 0
        ? "Partial"
        : "Pending";
    const numAge = Number(formData.age) || 25;
    const numTotal = Number(formData.totalSessions) || 12;

    try {
      setIsSubmitting(true);
      if (memberToEdit) {
        await adultsService.update1on1(
          memberToEdit.id,
          {
            ...formData,
            age: numAge,
            totalSessions: numTotal,
            feeAmount: fee,
            paidAmount: paid,
            dueAmount,
            paymentStatus,
          },
          "ADM001"
        );
      } else {
        await adultsService.create1on1(
          {
            ...formData,
            age: numAge,
            totalSessions: numTotal,
            feeAmount: fee,
            paidAmount: paid,
            dueAmount,
            paymentStatus,
            month: "March",
            year: selectedYear,
            sessionsCompleted: 0,
            sessionsRemaining: numTotal,
          },
          {
            branchId: targetBranchId,
            branchName: targetBranchName,
            employeeId: "ADM001",
            employeeName: "Super Admin",
          }
        );
      }
      setMembers(adultsService.getSnapshot1on1());
      setIsFormOpen(false);
      setMemberToEdit(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save player. Please try again.";
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
              Adults Coaching 1-1
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Medal className="w-3.5 h-3.5" />
              <span>{filteredMembers.length} Records</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Personalized 1-on-1 private coaching sessions for adults and advanced players.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Adults_Coaching_1on1"
            moduleTitle="Adults Coaching 1-1 Registry"
            subtitle={`Branch: ${selectedBranch === "all" ? "All Branches" : selectedBranch}`}
            columns={EXPORT_COLUMNS}
            currentViewData={filteredMembers}
            selectedData={selectedMembers}
            entireModuleData={members}
          />
          <Button
            onClick={handleOpenAdd}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add 1-1 Player</span>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">1-1 Trainees</p>
              <h3 className="text-xl font-bold text-slate-900">{metrics.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Medal className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Players</p>
              <h3 className="text-xl font-bold text-blue-600">{metrics.active}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Completed Sessions</p>
              <h3 className="text-xl font-bold text-purple-600">{metrics.sessions}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending Dues</p>
              <h3 className="text-xl font-bold text-rose-600">₹{metrics.totalDue}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by player mobile number..."
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
          <h3 className="text-base font-bold text-slate-800">No 1-1 adult trainees found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or register a new 1-1 adult trainee.</p>
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
                  <th className="px-3.5 py-3 whitespace-nowrap">Branch</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Timing Slot</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Package</th>
                  <th className="px-3.5 py-3 text-center whitespace-nowrap">Sessions</th>
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
                {filteredMembers.map((m) => {
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
                        #{m.serialNumber}
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
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {m.branchName || "Nallagandla"}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
                        {m.coach}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap max-w-[150px] truncate" title={m.preferredTiming}>
                        {m.preferredTiming}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-600">
                        {m.sessionPackage}
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap font-medium">
                        <span className="text-blue-600">{m.sessionsCompleted}</span>
                        <span className="text-slate-400"> / {m.totalSessions}</span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ₹{m.feeAmount}
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
                            title="View Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
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
                <div className="flex justify-between"><span className="text-slate-500">Branch:</span><span className="font-semibold text-slate-800">{viewingMember.branchName || "Nallagandla"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Coach:</span><span className="font-semibold text-slate-800">{viewingMember.coach}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Timing Slot:</span><span className="font-semibold text-slate-800">{viewingMember.preferredTiming}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Package:</span><span className="font-semibold text-slate-800">{viewingMember.sessionPackage}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Sessions Completed:</span><span className="font-semibold text-blue-600">{viewingMember.sessionsCompleted} / {viewingMember.totalSessions}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total Fee:</span><span className="font-semibold text-slate-800">₹{viewingMember.feeAmount}</span></div>
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
                  {memberToEdit ? "Edit 1-1 Player" : "Register 1-1 Player"}
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Player Name</Label>
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
                  <div>
                    <Label className="text-xs">Timing Slot</Label>
                    <select
                      value={formData.preferredTiming}
                      onChange={(e) => setFormData({ ...formData, preferredTiming: e.target.value })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                    >
                      {TIMING_SLOTS_1ON1.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Session Package</Label>
                  <select
                    value={formData.sessionPackage}
                    onChange={(e) => setFormData({ ...formData, sessionPackage: e.target.value })}
                    className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                  >
                    {SESSION_PACKAGES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Total Fee (₹)</Label>
                    <Input
                      type="number"
                      value={formData.feeAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          feeAmount:
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
                      value={formData.paidAmount}
                      onChange={(e) => {
                        const val =
                          e.target.value === ""
                            ? ""
                            : Math.max(0, parseInt(e.target.value, 10) || 0);
                        const paidNum = val === "" ? 0 : val;
                        const feeNum = formData.feeAmount === "" ? 0 : formData.feeAmount;
                        const due = feeNum - paidNum;
                        setFormData({
                          ...formData,
                          paidAmount: val,
                          paymentStatus: due <= 0 ? "Paid" : paidNum > 0 ? "Partial" : "Pending",
                        });
                      }}
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
                    className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmitting ? "Saving..." : memberToEdit ? "Update Player" : "Save Player"}
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
