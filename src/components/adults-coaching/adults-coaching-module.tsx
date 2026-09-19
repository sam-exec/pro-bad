"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Users,
  Eye,
  Edit2,
  X,
  Phone,
  Calendar,
  AlertCircle,
  Trophy,
  Clock,
  DollarSign,
  Award,
} from "lucide-react";
import {
  AdultCoachMember,
  ADULT_BATCHES,
} from "@/types/coaching-modules";
import { COACHES, MONTHS, YEARS, Gender, StudentStatus } from "@/types/kids-coaching";
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
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
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

export function AdultsCoachingModule() {
  const { employeeId, employeeName } = useAuth();
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

  // Drawer and Modal States
  const [viewingMember, setViewingMember] = useState<AdultCoachMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<AdultCoachMember | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form Fields
  const [memberName, setMemberName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<Gender>("Male");
  const [joiningDate, setJoiningDate] = useState("2026-03-01");
  const [batch, setBatch] = useState<string>(ADULT_BATCHES[0]);
  const [coach, setCoach] = useState<string>(COACHES[0]);
  const [monthlyFee, setMonthlyFee] = useState<number | "">("");
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");
  const [currentMonth, setCurrentMonth] = useState<string>("March");
  const [status, setStatus] = useState<StudentStatus>("Active");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (memberToEdit) {
      setMemberName(memberToEdit.memberName);
      setMobileNumber(memberToEdit.mobileNumber);
      setAge(memberToEdit.age ?? "");
      setGender(memberToEdit.gender);
      setJoiningDate(memberToEdit.joiningDate);
      setBatch(memberToEdit.batch);
      setCoach(memberToEdit.coach);
      setMonthlyFee(memberToEdit.monthlyFee ?? "");
      setPaidAmount(memberToEdit.paidAmount ?? "");
      setPaymentMethod(memberToEdit.paymentMethod || "UPI");
      setCurrentMonth(memberToEdit.currentMonth);
      setStatus(memberToEdit.status);
      setRemarks(memberToEdit.remarks || "");
    } else {
      setMemberName("");
      setMobileNumber("");
      setAge("");
      setGender("Male");
      setJoiningDate(new Date().toISOString().split("T")[0]);
      setBatch(ADULT_BATCHES[0]);
      setCoach(COACHES[0]);
      setMonthlyFee("");
      setPaidAmount("");
      setPaymentMethod("UPI");
      setCurrentMonth("March");
      setStatus("Active");
      setRemarks("");
    }
    setErrors({});
    setFormError("");
    setIsSubmitting(false);
  }, [memberToEdit, isFormOpen]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (searchQuery.trim() && !universalMatch(m, searchQuery)) return false;
      if (selectedMonth !== "All" && m.currentMonth !== selectedMonth) return false;
      if (m.year !== selectedYear) return false;
      if (paymentMethodFilter !== "all" && m.paymentMethod !== paymentMethodFilter) return false;
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

  const isAllCurrentSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedIds.includes(m.id));

  const handleToggleSelectAll = () => {
    if (isAllCurrentSelected) {
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

  // Save / Edit Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const newErrors: Record<string, string> = {};
    if (!memberName.trim()) newErrors.memberName = "Member name is required.";
    if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber.replace(/\D/g, ""))) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }
    if (age === "" || Number(age) < 16) newErrors.age = "Adult members must be 16+.";
    if (monthlyFee === "" || Number(monthlyFee) < 0) newErrors.monthlyFee = "Monthly fee is required.";
    if (paidAmount !== "" && Number(paidAmount) > 0 && !paymentMethod) {
      newErrors.paymentMethod = "Payment method is required when paid amount > 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormError("Please fill in all required fields highlighted in red.");
      const firstId = Object.keys(newErrors)[0];
      const el = document.getElementById(firstId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      } else if (formRef.current) {
        formRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const numFee = monthlyFee === "" ? 0 : Number(monthlyFee);
    const numPaid = paidAmount === "" ? 0 : Number(paidAmount);
    const dueAmount = Math.max(0, numFee - numPaid);
    const paymentStatus =
      dueAmount === 0 && numPaid > 0
        ? "Paid"
        : numPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";

    try {
      setIsSubmitting(true);
      if (memberToEdit) {
        const updated = await adultsService.update(
          memberToEdit.id,
          {
            memberName: memberName.trim(),
            mobileNumber: mobileNumber.trim(),
            age: Number(age),
            gender,
            joiningDate,
            batch,
            coach,
            monthlyFee: numFee,
            paidAmount: numPaid,
            dueAmount,
            paymentStatus,
            paymentMethod,
            currentMonth,
            status,
            remarks: remarks.trim(),
          },
          employeeId
        );

        setMembers((prev) =>
          prev.map((item) => (item.id === memberToEdit.id ? updated : item))
        );
        if (viewingMember?.id === memberToEdit.id) {
          setViewingMember(updated);
        }
      } else {
        const created = await adultsService.create(
          {
            memberName: memberName.trim(),
            mobileNumber: mobileNumber.trim(),
            age: Number(age),
            gender,
            joiningDate,
            batch,
            coach,
            monthlyFee: numFee,
            paidAmount: numPaid,
            dueAmount,
            paymentStatus,
            paymentMethod,
            currentMonth,
            year: 2026,
            status,
            remarks: remarks.trim(),
          },
          {
            employeeId,
            employeeName,
          }
        );

        setMembers((prev) => [created, ...prev]);
      }

      setIsFormOpen(false);
      setMemberToEdit(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save member. Please try again.";
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
      {/* Top Header */}
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
            Group coaching and competitive squad training.
          </p>
        </div>

        {/* Action Buttons: Export + Add Member */}
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
            onClick={() => {
              setMemberToEdit(null);
              setIsFormOpen(true);
            }}
            className="h-10 px-4 rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Adult Member</span>
          </Button>
        </div>
      </div>

      {/* 1. Standardized 4 KPI Summary Cards */}
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
              Fully paid accounts
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Pending Balance
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
              ₹{metrics.totalDue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Outstanding dues
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Standardized Search & Filter Bar */}
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

      {/* 3. Interactive Data Table with Selection */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No adult members found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or register a new adult member.</p>
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
                      checked={isAllCurrentSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      title="Select All Records"
                    />
                  </th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Serial No</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Member Name</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Mobile Number</th>
                  <th className="px-3.5 py-3 text-center whitespace-nowrap">Age/Gender</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Batch</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Monthly Fee</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Due</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Month</th>
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
                        isChecked ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(m.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
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
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        {m.age} yrs • {m.gender}
                      </td>
                      <td className="px-3.5 py-3 max-w-[170px] truncate" title={m.batch}>
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
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-600">
                        {m.currentMonth} {m.year}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingMember(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMemberToEdit(m);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
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

      {/* View Drawer */}
      {viewingMember && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingMember(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {viewingMember.memberName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{viewingMember.memberName}</h2>
                    <StatusBadge status={viewingMember.status} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Serial No: #{viewingMember.serialNumber}</p>
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

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Personal Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</span>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div><span className="text-slate-400">Mobile</span><p className="font-semibold text-slate-800 font-mono">{viewingMember.mobileNumber}</p></div>
                  <div><span className="text-slate-400">Age</span><p className="font-semibold text-slate-800">{viewingMember.age} yrs</p></div>
                  <div><span className="text-slate-400">Gender</span><p className="font-semibold text-slate-800">{viewingMember.gender}</p></div>
                  <div><span className="text-slate-400">Joining Date</span><p className="font-semibold text-slate-800">{viewingMember.joiningDate}</p></div>
                </div>
              </div>

              {/* Coaching Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Coaching Information</span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div><span className="text-slate-400">Batch</span><p className="font-semibold text-slate-800">{viewingMember.batch}</p></div>
                  <div><span className="text-slate-400">Coach</span><p className="font-semibold text-slate-800">{viewingMember.coach}</p></div>
                  <div><span className="text-slate-400">Billing Month</span><p className="font-semibold text-slate-800">{viewingMember.currentMonth} {viewingMember.year}</p></div>
                  {viewingMember.remarks && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400">Remarks</span>
                      <p className="text-slate-700 italic mt-0.5">&quot;{viewingMember.remarks}&quot;</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Details */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fee Details</span>
                <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-center">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Monthly</span>
                    <p className="text-base font-bold text-slate-900 mt-1">₹{viewingMember.monthlyFee}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Paid</span>
                    <p className="text-base font-bold text-emerald-600 mt-1">₹{viewingMember.paidAmount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Due</span>
                    <p className="text-base font-bold text-rose-600 mt-1">₹{viewingMember.dueAmount}</p>
                  </div>
                  <div className="col-span-3 pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <span className="text-slate-500">Method:</span>
                    <PaymentMethodBadge method={viewingMember.paymentMethod} />
                  </div>
                  <div className="col-span-3 pt-1 flex items-center justify-between">
                    <span className="text-slate-500">Status:</span>
                    <PaymentBadge status={viewingMember.paymentStatus} />
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Information</span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-slate-500">
                  <div className="flex justify-between"><span>Record ID:</span><span className="font-mono">{viewingMember.recordId}</span></div>
                  <div className="flex justify-between"><span>Employee:</span><span>{viewingMember.employeeName} ({viewingMember.employeeId})</span></div>
                  <div className="flex justify-between"><span>Created At:</span><span>{new Date(viewingMember.createdAt).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span>Last Updated:</span><span>{new Date(viewingMember.updatedAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center gap-3">
              <Button variant="outline" onClick={() => setViewingMember(null)} className="flex-1">Close</Button>
              <Button
                onClick={() => {
                  const toEdit = viewingMember;
                  setViewingMember(null);
                  setMemberToEdit(toEdit);
                  setIsFormOpen(true);
                }}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Member</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsFormOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:w-full sm:max-w-2xl z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {memberToEdit ? "Edit Adult Member" : "Add Adult Member"}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} noValidate onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mName" required>Member Name</Label>
                  <Input
                    id="mName"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    hasError={Boolean(errors.memberName)}
                  />
                  {errors.memberName && <p className="text-xs text-red-600 mt-1">{errors.memberName}</p>}
                </div>
                <div>
                  <Label htmlFor="mPhone" required>Mobile Number</Label>
                  <Input
                    id="mPhone"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    hasError={Boolean(errors.mobileNumber)}
                  />
                  {errors.mobileNumber && <p className="text-xs text-red-600 mt-1">{errors.mobileNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="mAge" required>Age</Label>
                    <Input
                      id="mAge"
                      type="number"
                      value={age}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAge(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                      }}
                      placeholder="e.g. 25"
                      hasError={Boolean(errors.age)}
                    />
                    {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <Label htmlFor="mGen" required>Gender</Label>
                    <select
                      id="mGen"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="mJoin" required>Joining Date</Label>
                  <Input
                    id="mJoin"
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="mBatch" required>Batch</Label>
                  <select
                    id="mBatch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                  >
                    {ADULT_BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="mCoach" required>Coach</Label>
                  <select
                    id="mCoach"
                    value={coach}
                    onChange={(e) => setCoach(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                  >
                    {COACHES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="mMonth" required>Current Month</Label>
                  <select
                    id="mMonth"
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                  >
                    {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="mFee" required>Monthly Fee (₹)</Label>
                  <Input
                    id="mFee"
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMonthlyFee(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                    }}
                    placeholder="e.g. 2000"
                    hasError={Boolean(errors.monthlyFee)}
                  />
                  {errors.monthlyFee && <p className="text-xs text-red-600 mt-1">{errors.monthlyFee}</p>}
                </div>
                <div>
                  <Label htmlFor="mPaid">Paid Amount (₹)</Label>
                  <Input
                    id="mPaid"
                    type="number"
                    value={paidAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPaidAmount(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                    }}
                    placeholder="e.g. 2000"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod" required={Number(paidAmount) > 0}>Payment Method</Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                  {errors.paymentMethod && <p className="text-xs text-red-600">{errors.paymentMethod}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="mStatus" required>Status</Label>
                  <select
                    id="mStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StudentStatus)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="mRem">Remarks</Label>
                  <Input
                    id="mRem"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Doubles/Singles rating, goals..."
                  />
                </div>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1 font-medium">{formError}</div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer font-semibold"
                >
                  {isSubmitting
                    ? "Saving..."
                    : memberToEdit
                    ? "Update Member"
                    : "Save Member"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
