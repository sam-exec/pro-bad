"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Users,
  Eye,
  Edit2,
  X,
  User,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  Phone,
  AlertCircle,
  GraduationCap,
  Award,
  DollarSign,
} from "lucide-react";
import {
  Kids1on1Student,
  SESSION_PACKAGES,
  TIMING_SLOTS_1ON1,
} from "@/types/coaching-modules";
import { COACHES, MONTHS, YEARS, Gender, StudentStatus } from "@/types/kids-coaching";
import { PaymentMethod } from "@/types/payment";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { kidsService } from "@/services/excel";
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

const EXPORT_COLUMNS: ExportColumn<Kids1on1Student>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (_r, idx) => `${idx + 1}` },
  { header: "Student Name", key: "studentName" },
  { header: "Parent Name", key: "parentName" },
  { header: "Mobile", key: "parentMobile" },
  { header: "Age", key: "age" },
  { header: "Gender", key: "gender" },
  { header: "Coach", key: "coach" },
  { header: "Timing", key: "preferredTiming" },
  { header: "Package", key: "sessionPackage" },
  { header: "Completed Sessions", key: "sessionsCompleted" },
  { header: "Remaining Sessions", key: "sessionsRemaining" },
  { header: "Total Fee", key: "feeAmount", formatter: (r) => `₹${r.feeAmount}` },
  { header: "Paid Amount", key: "amountPaid", formatter: (r) => `₹${r.amountPaid}` },
  { header: "Due Amount", key: "dueAmount", formatter: (r) => `₹${r.dueAmount}` },
  { header: "Payment Method", key: "paymentMethod" },
  { header: "Payment Status", key: "paymentStatus" },
  { header: "Status", key: "status" },
  { header: "Joining Date", key: "joiningDate" },
];

export function KidsCoaching1on1Module() {
  const { employeeId, employeeName } = useAuth();
  const [students, setStudents] = useState<Kids1on1Student[]>(() =>
    kidsService.getSnapshot1on1()
  );

  useEffect(() => {
    const handleUpdate = () => setStudents(kidsService.getSnapshot1on1());
    window.addEventListener("excel-data-updated", handleUpdate);
    return () => window.removeEventListener("excel-data-updated", handleUpdate);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Drawer and Modal States
  const [viewingStudent, setViewingStudent] = useState<Kids1on1Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Kids1on1Student | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form Fields
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<Gender>("Male");
  const [coach, setCoach] = useState<string>(COACHES[0]);
  const [preferredTiming, setPreferredTiming] = useState<string>(TIMING_SLOTS_1ON1[0]);
  const [sessionPackage, setSessionPackage] = useState<string>(SESSION_PACKAGES[0]);
  const [totalSessions, setTotalSessions] = useState<number | "">("");
  const [sessionsCompleted, setSessionsCompleted] = useState<number | "">("");
  const [feeAmount, setFeeAmount] = useState<number | "">("");
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");
  const [status, setStatus] = useState<StudentStatus>("Active");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or Populate Form
  useEffect(() => {
    if (studentToEdit) {
      setStudentName(studentToEdit.studentName);
      setParentName(studentToEdit.parentName);
      setParentMobile(studentToEdit.parentMobile);
      setAge(studentToEdit.age ?? "");
      setGender(studentToEdit.gender);
      setCoach(studentToEdit.coach);
      setPreferredTiming(studentToEdit.preferredTiming);
      setSessionPackage(studentToEdit.sessionPackage);
      setTotalSessions(studentToEdit.totalSessions ?? "");
      setSessionsCompleted(studentToEdit.sessionsCompleted ?? "");
      setFeeAmount(studentToEdit.feeAmount ?? "");
      setAmountPaid(studentToEdit.amountPaid ?? "");
      setPaymentMethod(studentToEdit.paymentMethod || "UPI");
      setStatus(studentToEdit.status);
      setRemarks(studentToEdit.remarks || "");
    } else {
      setStudentName("");
      setParentName("");
      setParentMobile("");
      setAge("");
      setGender("Male");
      setCoach(COACHES[0]);
      setPreferredTiming(TIMING_SLOTS_1ON1[0]);
      setSessionPackage(SESSION_PACKAGES[0]);
      setTotalSessions(8);
      setSessionsCompleted(0);
      setFeeAmount("");
      setAmountPaid("");
      setPaymentMethod("UPI");
      setStatus("Active");
      setRemarks("");
    }
    setErrors({});
    setFormError("");
    setIsSubmitting(false);
  }, [studentToEdit, isFormOpen]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredStudents = useMemo(() => {
    const seenIds = new Set<string>();
    return students.filter((s) => {
      if (seenIds.has(s.id)) {
        return false;
      }
      seenIds.add(s.id);

      if (searchQuery.trim() && !universalMatch(s, searchQuery)) {
        return false;
      }
      if (selectedMonth !== "All" && s.month !== selectedMonth) return false;
      if (s.year !== selectedYear) return false;
      if (paymentMethodFilter !== "all" && s.paymentMethod !== paymentMethodFilter) return false;
      return true;
    });
  }, [students, searchQuery, selectedMonth, selectedYear, paymentMethodFilter]);

  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllCurrentSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllCurrentSelected) {
      const cur = new Set(filteredStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !cur.has(id)));
    } else {
      const cur = filteredStudents.map((s) => s.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...cur])));
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const active = filteredStudents.filter((s) => s.status === "Active").length;
    const completedSessions = filteredStudents.reduce((sum, s) => sum + (s.sessionsCompleted || 0), 0);
    const totalDue = filteredStudents.reduce((sum, s) => sum + (s.dueAmount || 0), 0);
    return { total, active, completedSessions, totalDue };
  }, [filteredStudents]);

  // Save / Update Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const newErrors: Record<string, string> = {};
    if (!studentName.trim()) newErrors.studentName = "Student name is required.";
    if (!parentName.trim()) newErrors.parentName = "Parent name is required.";
    if (!parentMobile.trim() || !/^\d{10}$/.test(parentMobile.replace(/\D/g, ""))) {
      newErrors.parentMobile = "Enter a valid 10-digit parent phone.";
    }
    if (age === "" || Number(age) <= 0) newErrors.age = "Valid age is required.";
    if (feeAmount === "" || Number(feeAmount) < 0) newErrors.feeAmount = "Fee amount is required.";
    if (amountPaid !== "" && Number(amountPaid) > 0 && !paymentMethod) {
      newErrors.paymentMethod = "Payment method is required when amount paid > 0.";
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

    const numFee = feeAmount === "" ? 0 : Number(feeAmount);
    const numPaid = amountPaid === "" ? 0 : Number(amountPaid);
    const dueAmount = Math.max(0, numFee - numPaid);
    const paymentStatus =
      dueAmount === 0 && numPaid > 0
        ? "Paid"
        : numPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";
    const numTotalSessions = Number(totalSessions) || 8;
    const numSessionsCompleted = Number(sessionsCompleted) || 0;
    const remainingSessions = Math.max(0, numTotalSessions - numSessionsCompleted);
    const now = new Date().toISOString();

    try {
      setIsSubmitting(true);
      if (studentToEdit) {
        const updated = await kidsService.update1on1(
          studentToEdit.id,
          {
            studentName: studentName.trim(),
            parentName: parentName.trim(),
            parentMobile: parentMobile.trim(),
            age: Number(age),
            gender,
            coach,
            preferredTiming,
            sessionPackage,
            totalSessions: numTotalSessions,
            sessionsCompleted: numSessionsCompleted,
            sessionsRemaining: remainingSessions,
            feeAmount: numFee,
            amountPaid: numPaid,
            dueAmount,
            paymentStatus,
            paymentMethod,
            status,
            remarks: remarks.trim(),
          },
          employeeId
        );

        setStudents((prev) =>
          prev.map((item) => (item.id === studentToEdit.id ? updated : item))
        );
        if (viewingStudent?.id === studentToEdit.id) {
          setViewingStudent(updated);
        }
      } else {
        const created = await kidsService.create1on1(
          {
            studentName: studentName.trim(),
            parentName: parentName.trim(),
            parentMobile: parentMobile.trim(),
            age: Number(age),
            gender,
            coach,
            preferredTiming,
            sessionPackage,
            totalSessions: numTotalSessions,
            sessionsCompleted: numSessionsCompleted,
            sessionsRemaining: remainingSessions,
            feeAmount: numFee,
            amountPaid: numPaid,
            dueAmount,
            paymentStatus,
            paymentMethod,
            joiningDate: new Date().toISOString().split("T")[0],
            month: "March",
            year: 2026,
            status,
            remarks: remarks.trim(),
          },
          {
            employeeId,
            employeeName,
          }
        );
        setStudents(kidsService.getSnapshot1on1());
      }

      setIsFormOpen(false);
      setStudentToEdit(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save student. Please try again.";
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
              Kids Coaching 1-1
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Users className="w-3.5 h-3.5" />
              <span>{filteredStudents.length} Records</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Personalized one-on-one junior training sessions.
          </p>
        </div>

        {/* Action Buttons: Export + Add Student */}
        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Kids_Coaching_1on1"
            moduleTitle="Kids Coaching 1-1 Registry"
            subtitle="Facility 1-1 Student Registry"
            columns={EXPORT_COLUMNS}
            currentViewData={filteredStudents}
            selectedData={selectedStudents}
            entireModuleData={students}
          />
          <Button
            onClick={() => {
              setStudentToEdit(null);
              setIsFormOpen(true);
            }}
            className="h-10 px-4 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add 1-1 Student</span>
          </Button>
        </div>
      </div>

      {/* 1. Standardized 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1-1 Enrolled */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              1-1 Enrolled
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Registered trainees
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Squad */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Squad
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              {metrics.active}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Ongoing training slots
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Sessions Delivered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Sessions Delivered
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1 block">
              {metrics.completedSessions}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Completed court hours
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Dues */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Pending Dues
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
              ₹{metrics.totalDue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Uncollected balances
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
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
      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No 1-1 students found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or register a new 1-1 coaching student.</p>
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
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Select All Records"
                    />
                  </th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Serial No</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Student Name</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Parent Details</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Preferred Slot</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Package</th>
                  <th className="px-3.5 py-3 text-center whitespace-nowrap">Sessions</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Total Fee</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Due</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredStudents.map((s, index) => {
                  const isChecked = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors text-xs text-slate-700 ${
                        isChecked ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(s.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3.5 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        #{index + 1}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {s.studentName} ({s.age}y, {s.gender})
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{s.parentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{s.parentMobile}</div>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
                        {s.coach}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap max-w-[150px] truncate" title={s.preferredTiming}>
                        {s.preferredTiming}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-600">
                        {s.sessionPackage}
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap font-medium">
                        <span className="text-blue-600 font-semibold">{s.sessionsCompleted}</span>
                        <span className="text-slate-400"> / {s.totalSessions}</span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ₹{s.feeAmount}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        ₹{s.amountPaid}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                        ₹{s.dueAmount}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentMethodBadge method={s.paymentMethod} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentBadge status={s.paymentStatus} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStudentToEdit(s);
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

      {/* View Details Drawer */}
      {viewingStudent && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingStudent(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {viewingStudent.studentName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{viewingStudent.studentName}</h2>
                    <StatusBadge status={viewingStudent.status} />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Serial No: #{viewingStudent.serialNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Student Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Information</span>
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div><span className="text-slate-400">Parent Name</span><p className="font-semibold text-slate-800">{viewingStudent.parentName}</p></div>
                  <div><span className="text-slate-400">Parent Mobile</span><p className="font-semibold text-slate-800 font-mono">{viewingStudent.parentMobile}</p></div>
                  <div><span className="text-slate-400">Age</span><p className="font-semibold text-slate-800">{viewingStudent.age} yrs</p></div>
                  <div><span className="text-slate-400">Gender</span><p className="font-semibold text-slate-800">{viewingStudent.gender}</p></div>
                </div>
              </div>

              {/* Coaching Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Coaching Information</span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div><span className="text-slate-400">Coach</span><p className="font-semibold text-slate-800">{viewingStudent.coach}</p></div>
                  <div><span className="text-slate-400">Preferred Timing</span><p className="font-semibold text-slate-800">{viewingStudent.preferredTiming}</p></div>
                  <div><span className="text-slate-400">Joining Date</span><p className="font-semibold text-slate-800">{viewingStudent.joiningDate}</p></div>
                </div>
              </div>

              {/* Session Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Session Information</span>
                <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-center">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Total</span>
                    <p className="text-base font-bold text-slate-800 mt-1">{viewingStudent.totalSessions}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Completed</span>
                    <p className="text-base font-bold text-blue-600 mt-1">{viewingStudent.sessionsCompleted}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Remaining</span>
                    <p className="text-base font-bold text-emerald-600 mt-1">{viewingStudent.sessionsRemaining}</p>
                  </div>
                  <div className="col-span-3 text-left pt-2 text-[11px] text-slate-500">
                    Package: <strong className="text-slate-800">{viewingStudent.sessionPackage}</strong>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Information</span>
                <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-center">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Fee</span>
                    <p className="text-base font-bold text-slate-900 mt-1">₹{viewingStudent.feeAmount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Paid</span>
                    <p className="text-base font-bold text-emerald-600 mt-1">₹{viewingStudent.amountPaid}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-slate-400">Due</span>
                    <p className="text-base font-bold text-rose-600 mt-1">₹{viewingStudent.dueAmount}</p>
                  </div>
                  <div className="col-span-3 pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <span className="text-slate-500">Method:</span>
                    <PaymentMethodBadge method={viewingStudent.paymentMethod} />
                  </div>
                  <div className="col-span-3 pt-1 flex items-center justify-between">
                    <span className="text-slate-500">Status:</span>
                    <PaymentBadge status={viewingStudent.paymentStatus} />
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Information</span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-slate-500">
                  <div className="flex justify-between"><span>Record ID:</span><span className="font-mono">{viewingStudent.recordId}</span></div>
                  <div className="flex justify-between"><span>Employee:</span><span>{viewingStudent.employeeName} ({viewingStudent.employeeId})</span></div>
                  <div className="flex justify-between"><span>Created At:</span><span>{new Date(viewingStudent.createdAt).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span>Last Updated:</span><span>{new Date(viewingStudent.updatedAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center gap-3">
              <Button variant="outline" onClick={() => setViewingStudent(null)} className="flex-1">Close</Button>
              <Button
                onClick={() => {
                  const toEdit = viewingStudent;
                  setViewingStudent(null);
                  setStudentToEdit(toEdit);
                  setIsFormOpen(true);
                }}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Student</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Form Modal */}
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
                {studentToEdit ? "Edit 1-1 Student" : "Add 1-1 Student"}
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
                  <Label htmlFor="sName" required>Student Name</Label>
                  <Input
                    id="sName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Aarav Patel"
                    hasError={Boolean(errors.studentName)}
                  />
                  {errors.studentName && <p className="text-xs text-red-600 mt-1">{errors.studentName}</p>}
                </div>
                <div>
                  <Label htmlFor="pName" required>Parent Name</Label>
                  <Input
                    id="pName"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. Vikram Patel"
                    hasError={Boolean(errors.parentName)}
                  />
                  {errors.parentName && <p className="text-xs text-red-600 mt-1">{errors.parentName}</p>}
                </div>
                <div>
                  <Label htmlFor="pMobile" required>Parent Mobile</Label>
                  <Input
                    id="pMobile"
                    value={parentMobile}
                    onChange={(e) => setParentMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    hasError={Boolean(errors.parentMobile)}
                  />
                  {errors.parentMobile && <p className="text-xs text-red-600 mt-1">{errors.parentMobile}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="age" required>Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAge(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                      }}
                      placeholder="e.g. 10"
                      hasError={Boolean(errors.age)}
                    />
                    {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
                  </div>
                  <div>
                    <Label htmlFor="gender" required>Gender</Label>
                    <select
                      id="gender"
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
                  <Label htmlFor="coach" required>Coach</Label>
                  <select
                    id="coach"
                    value={coach}
                    onChange={(e) => setCoach(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                  >
                    {COACHES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="timing" required>Preferred Timing</Label>
                  <select
                    id="timing"
                    value={preferredTiming}
                    onChange={(e) => setPreferredTiming(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                  >
                    {TIMING_SLOTS_1ON1.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="pkg" required>Session Package</Label>
                  <select
                    id="pkg"
                    value={sessionPackage}
                    onChange={(e) => {
                      setSessionPackage(e.target.value);
                      const match = e.target.value.match(/^(\d+)/);
                      if (match) setTotalSessions(Number(match[1]));
                    }}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                  >
                    {SESSION_PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="tot" required>Total Sessions</Label>
                    <Input
                      id="tot"
                      type="number"
                      value={totalSessions}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTotalSessions(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                      }}
                      placeholder="e.g. 8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comp" required>Completed</Label>
                    <Input
                      id="comp"
                      type="number"
                      value={sessionsCompleted}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSessionsCompleted(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                      }}
                      placeholder="e.g. 0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fee" required>Fee Amount (₹)</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={feeAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFeeAmount(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                    }}
                    placeholder="e.g. 2500"
                    hasError={Boolean(errors.feeAmount)}
                  />
                  {errors.feeAmount && <p className="text-xs text-red-600 mt-1">{errors.feeAmount}</p>}
                </div>
                <div>
                  <Label htmlFor="paid">Amount Paid (₹)</Label>
                  <Input
                    id="paid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAmountPaid(val === "" ? "" : Math.max(0, parseInt(val, 10) || 0));
                    }}
                    placeholder="e.g. 2500"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod" required={Number(amountPaid) > 0}>Payment Method</Label>
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
                  <Label htmlFor="status" required>Status</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StudentStatus)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="rem">Remarks</Label>
                  <Input
                    id="rem"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Progress, focus areas..."
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
                    : studentToEdit
                    ? "Update Student"
                    : "Save Student"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
