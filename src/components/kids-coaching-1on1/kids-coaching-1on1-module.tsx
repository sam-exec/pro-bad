"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import {
  Kids1on1Student,
  SESSION_PACKAGES,
  TIMING_SLOTS_1ON1,
} from "@/types/coaching-modules";
import { COACHES, MONTHS, YEARS, Gender, StudentStatus } from "@/types/kids-coaching";
import { kidsService } from "@/services/excel";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { MonthFilter } from "@/components/kids-coaching/month-filter";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentBadge } from "@/components/kids-coaching/payment-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useBranch } from "@/context/branch-context";

export function KidsCoaching1on1Module() {
  const { currentBranch, employeeId, employeeName } = useBranch();
  const [students, setStudents] = useState<Kids1on1Student[]>(() =>
    kidsService.getSnapshot1on1()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Drawer and Modal States
  const [viewingStudent, setViewingStudent] = useState<Kids1on1Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Kids1on1Student | null>(null);

  // Form Fields
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [age, setAge] = useState<number>(10);
  const [gender, setGender] = useState<Gender>("Male");
  const [coach, setCoach] = useState<string>(COACHES[0]);
  const [preferredTiming, setPreferredTiming] = useState<string>(TIMING_SLOTS_1ON1[0]);
  const [sessionPackage, setSessionPackage] = useState<string>(SESSION_PACKAGES[0]);
  const [totalSessions, setTotalSessions] = useState<number>(8);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  const [feeAmount, setFeeAmount] = useState<number>(250);
  const [amountPaid, setAmountPaid] = useState<number>(250);
  const [status, setStatus] = useState<StudentStatus>("Active");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or Populate Form
  useEffect(() => {
    if (studentToEdit) {
      setStudentName(studentToEdit.studentName);
      setParentName(studentToEdit.parentName);
      setParentMobile(studentToEdit.parentMobile);
      setAge(studentToEdit.age);
      setGender(studentToEdit.gender);
      setCoach(studentToEdit.coach);
      setPreferredTiming(studentToEdit.preferredTiming);
      setSessionPackage(studentToEdit.sessionPackage);
      setTotalSessions(studentToEdit.totalSessions);
      setSessionsCompleted(studentToEdit.sessionsCompleted);
      setFeeAmount(studentToEdit.feeAmount);
      setAmountPaid(studentToEdit.amountPaid);
      setStatus(studentToEdit.status);
      setRemarks(studentToEdit.remarks || "");
    } else {
      setStudentName("");
      setParentName("");
      setParentMobile("");
      setAge(10);
      setGender("Male");
      setCoach(COACHES[0]);
      setPreferredTiming(TIMING_SLOTS_1ON1[0]);
      setSessionPackage(SESSION_PACKAGES[0]);
      setTotalSessions(8);
      setSessionsCompleted(0);
      setFeeAmount(250);
      setAmountPaid(250);
      setStatus("Active");
      setRemarks("");
    }
    setErrors({});
  }, [studentToEdit, isFormOpen]);

  // Filter logic: branch isolation + search by Parent Mobile Number + Month/Year
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (s.branchId && s.branchId !== currentBranch.id) return false;
      if (searchQuery.trim()) {
        const cleanQuery = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = s.parentMobile.replace(/\D/g, "");
        if (!cleanPhone.includes(cleanQuery)) return false;
      }
      if (selectedMonth !== "All" && s.month !== selectedMonth) return false;
      if (s.year !== selectedYear) return false;
      return true;
    });
  }, [students, currentBranch.id, searchQuery, selectedMonth, selectedYear]);

  // Save / Update Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!studentName.trim()) newErrors.studentName = "Student name is required.";
    if (!parentName.trim()) newErrors.parentName = "Parent name is required.";
    if (!parentMobile.trim() || !/^\d{10}$/.test(parentMobile.replace(/\D/g, ""))) {
      newErrors.parentMobile = "Enter a valid 10-digit parent phone.";
    }
    if (age <= 0) newErrors.age = "Valid age is required.";
    if (feeAmount < 0) newErrors.feeAmount = "Fee cannot be negative.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dueAmount = Math.max(0, feeAmount - amountPaid);
    const paymentStatus =
      dueAmount === 0 && amountPaid > 0
        ? "Paid"
        : amountPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";
    const remainingSessions = Math.max(0, totalSessions - sessionsCompleted);
    const now = new Date().toISOString();

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
          totalSessions: Number(totalSessions),
          sessionsCompleted: Number(sessionsCompleted),
          sessionsRemaining: remainingSessions,
          feeAmount: Number(feeAmount),
          amountPaid: Number(amountPaid),
          dueAmount,
          paymentStatus,
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
          totalSessions: Number(totalSessions),
          sessionsCompleted: Number(sessionsCompleted),
          sessionsRemaining: remainingSessions,
          feeAmount: Number(feeAmount),
          amountPaid: Number(amountPaid),
          dueAmount,
          paymentStatus,
          paymentMethod: "UPI",
          joiningDate: new Date().toISOString().split("T")[0],
          month: "March",
          year: 2026,
          status,
          remarks: remarks.trim(),
        },
        {
          branchId: currentBranch.id,
          branchName: currentBranch.name,
          employeeId,
          employeeName,
        }
      );
      setStudents((prev) => [created, ...prev]);
    }

    setIsFormOpen(false);
    setStudentToEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kids Coaching 1-1
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              📍 {currentBranch.name}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage students enrolled in one-to-one coaching sessions at <span className="font-semibold text-slate-700">{currentBranch.name} Branch</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-2xs">
            1-1 Students: <strong className="text-slate-900">{filteredStudents.length}</strong>
          </span>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Parent Mobile Number (e.g. 98765)..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <MonthFilter
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
          <Button
            onClick={() => {
              setStudentToEdit(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No students found.</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1.5 mb-6">
            No 1-1 students match the current filters.
          </p>
          <Button
            onClick={() => {
              setStudentToEdit(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table (18 Columns) */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-280px)] scrollbar-thin">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
                  <tr>
                    <th className="px-3 py-3 whitespace-nowrap">Serial No</th>
                    <th className="px-3 py-3 whitespace-nowrap">Student Name</th>
                    <th className="px-3 py-3 whitespace-nowrap">Parent Name</th>
                    <th className="px-3 py-3 whitespace-nowrap">Parent Mobile</th>
                    <th className="px-3 py-3 text-center whitespace-nowrap">Age</th>
                    <th className="px-3 py-3 whitespace-nowrap">Coach</th>
                    <th className="px-3 py-3 whitespace-nowrap">Preferred Timing</th>
                    <th className="px-3 py-3 whitespace-nowrap">Session Package</th>
                    <th className="px-3 py-3 text-center whitespace-nowrap">Completed</th>
                    <th className="px-3 py-3 text-center whitespace-nowrap">Remaining</th>
                    <th className="px-3 py-3 text-right whitespace-nowrap">Fee Amount</th>
                    <th className="px-3 py-3 text-right whitespace-nowrap">Amount Paid</th>
                    <th className="px-3 py-3 text-right whitespace-nowrap">Due Amount</th>
                    <th className="px-3 py-3 whitespace-nowrap">Payment</th>
                    <th className="px-3 py-3 whitespace-nowrap">Joining Date</th>
                    <th className="px-3 py-3 whitespace-nowrap">Status</th>
                    <th className="px-3 py-3 whitespace-nowrap">Last Updated</th>
                    <th className="px-3 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-3 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        #{s.serialNumber}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {s.studentName}
                      </td>
                      <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                        {s.parentName}
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {s.parentMobile}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {s.age}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-slate-800">
                        {s.coach}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600 max-w-[160px] truncate" title={s.preferredTiming}>
                        {s.preferredTiming}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                        {s.sessionPackage}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-blue-600 whitespace-nowrap">
                        {s.sessionsCompleted}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-slate-700 whitespace-nowrap">
                        {s.sessionsRemaining}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ₹{s.feeAmount}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        ₹{s.amountPaid}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                        ₹{s.dueAmount}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <PaymentBadge status={s.paymentStatus} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-500">
                        {s.joiningDate}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(s.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3.5">
            {filteredStudents.map((s) => (
              <Card key={s.id} className="border-slate-200/90 bg-white shadow-xs rounded-xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{s.studentName}</span>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">#{s.serialNumber}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{s.parentMobile}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.sessionsCompleted}/{s.totalSessions} Sessions</span>
                    </div>
                    <div className="col-span-2 text-[11px] text-slate-500 truncate">
                      <span className="font-medium text-slate-700">Coach:</span> {s.coach} &bull; {s.preferredTiming}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <PaymentBadge status={s.paymentStatus} />
                      <span className="text-xs font-semibold text-slate-700">
                        ₹{s.amountPaid} {s.dueAmount > 0 && <span className="text-rose-600 ml-1">Due: ₹{s.dueAmount}</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingStudent(s)}
                        className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStudentToEdit(s);
                          setIsFormOpen(true);
                        }}
                        className="h-8 px-2 text-xs text-slate-700 hover:text-slate-900"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
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
                  <div className="col-span-3 pt-2 flex items-center justify-between">
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

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sName" required>Student Name</Label>
                  <Input
                    id="sName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    hasError={Boolean(errors.studentName)}
                  />
                  {errors.studentName && <p className="text-xs text-red-600">{errors.studentName}</p>}
                </div>
                <div>
                  <Label htmlFor="pName" required>Parent Name</Label>
                  <Input
                    id="pName"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    hasError={Boolean(errors.parentName)}
                  />
                  {errors.parentName && <p className="text-xs text-red-600">{errors.parentName}</p>}
                </div>
                <div>
                  <Label htmlFor="pMobile" required>Parent Mobile</Label>
                  <Input
                    id="pMobile"
                    value={parentMobile}
                    onChange={(e) => setParentMobile(e.target.value)}
                    maxLength={10}
                    hasError={Boolean(errors.parentMobile)}
                  />
                  {errors.parentMobile && <p className="text-xs text-red-600">{errors.parentMobile}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="age" required>Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                    />
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
                      onChange={(e) => setTotalSessions(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="comp" required>Completed</Label>
                    <Input
                      id="comp"
                      type="number"
                      value={sessionsCompleted}
                      onChange={(e) => setSessionsCompleted(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fee" required>Fee Amount (₹)</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="paid" required>Amount Paid (₹)</Label>
                  <Input
                    id="paid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                  />
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

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {studentToEdit ? "Update Student" : "Save Student"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
