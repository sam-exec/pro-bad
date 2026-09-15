"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Users,
  Eye,
  Edit2,
  X,
  Calendar,
  DollarSign,
  Award,
} from "lucide-react";
import {
  Kids1on1Student,
  SESSION_PACKAGES,
  TIMING_SLOTS_1ON1,
} from "@/types/coaching-modules";
import { COACHES, Gender, StudentStatus, PaymentStatus, PaymentMethod } from "@/types/kids-coaching";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { kidsService } from "@/services/excel";
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

interface AdminKidsCoaching1on1Props {
  selectedBranch: string; // "all" | "branch-nlg" | "branch-mnk"
}

const EXPORT_COLUMNS: ExportColumn<Kids1on1Student>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (r) => `#${r.serialNumber ?? ""}` },
  { header: "Student Name", key: "studentName" },
  { header: "Parent Name", key: "parentName" },
  { header: "Mobile", key: "parentMobile" },
  { header: "Age", key: "age" },
  { header: "Gender", key: "gender" },
  { header: "Branch", key: "branchName", formatter: (r) => r.branchName || "Nallagandla" },
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

export function AdminKidsCoaching1on1({ selectedBranch }: AdminKidsCoaching1on1Props) {
  const [students, setStudents] = useState<Kids1on1Student[]>(() =>
    kidsService.getSnapshot1on1()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer & Modal state
  const [viewingStudent, setViewingStudent] = useState<Kids1on1Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Kids1on1Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    parentMobile: "",
    age: "" as unknown as number,
    gender: "Male" as Gender,
    coach: COACHES[0] as string,
    preferredTiming: TIMING_SLOTS_1ON1[0] as string,
    sessionPackage: SESSION_PACKAGES[0] as string,
    totalSessions: 8,
    feeAmount: "" as unknown as number,
    amountPaid: "" as unknown as number,
    paymentStatus: "Paid" as PaymentStatus,
    paymentMethod: "UPI" as PaymentMethod,
    joiningDate: "2026-03-01",
    status: "Active" as StudentStatus,
  });

  // Filtered
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedBranch !== "all" && s.branchId && s.branchId !== selectedBranch) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = s.parentMobile.replace(/\D/g, "");
        if (!cleanPhone.includes(q)) return false;
      }
      if (selectedMonth !== "All" && s.month !== selectedMonth) {
        return false;
      }
      if (s.year !== selectedYear) {
        return false;
      }
      if (paymentMethodFilter !== "all" && s.paymentMethod !== paymentMethodFilter) {
        return false;
      }
      return true;
    });
  }, [students, selectedBranch, searchQuery, selectedMonth, selectedYear, paymentMethodFilter]);

  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const cur = new Set(filteredStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !cur.has(id)));
    } else {
      const cur = filteredStudents.map((s) => s.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...cur])));
    }
  };

  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const active = filteredStudents.filter((s) => s.status === "Active").length;
    const totalDue = filteredStudents.reduce((sum, s) => sum + s.dueAmount, 0);
    const completedSessions = filteredStudents.reduce(
      (sum, s) => sum + s.sessionsCompleted,
      0
    );
    return { total, active, totalDue, completedSessions };
  }, [filteredStudents]);

  const handleOpenAdd = () => {
    setStudentToEdit(null);
    setFormData({
      studentName: "",
      parentName: "",
      parentMobile: "",
      age: "" as unknown as number,
      gender: "Male",
      coach: COACHES[0],
      preferredTiming: TIMING_SLOTS_1ON1[0],
      sessionPackage: SESSION_PACKAGES[0],
      totalSessions: 8,
      feeAmount: "" as unknown as number,
      amountPaid: "" as unknown as number,
      paymentStatus: "Paid",
      paymentMethod: "UPI",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (s: Kids1on1Student) => {
    setStudentToEdit(s);
    setFormData({
      studentName: s.studentName,
      parentName: s.parentName,
      parentMobile: s.parentMobile,
      age: s.age,
      gender: s.gender,
      coach: s.coach,
      preferredTiming: s.preferredTiming,
      sessionPackage: s.sessionPackage,
      totalSessions: s.totalSessions,
      feeAmount: s.feeAmount,
      amountPaid: s.amountPaid,
      paymentStatus: s.paymentStatus,
      paymentMethod: s.paymentMethod || "UPI",
      joiningDate: s.joiningDate,
      status: s.status,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetBranchId = selectedBranch !== "all" ? selectedBranch : "branch-nlg";
    const targetBranchName = targetBranchId === "branch-mnk" ? "Manikonda" : "Nallagandla";
    const numFee = Number(formData.feeAmount) || 0;
    const numPaid = Number(formData.amountPaid) || 0;
    const dueAmount = Math.max(0, numFee - numPaid);

    if (studentToEdit) {
      await kidsService.update1on1(
        studentToEdit.id,
        {
          ...formData,
          feeAmount: numFee,
          amountPaid: numPaid,
          age: Number(formData.age) || 10,
          dueAmount,
        },
        "ADM001"
      );
    } else {
      await kidsService.create1on1(
        {
          ...formData,
          feeAmount: numFee,
          amountPaid: numPaid,
          age: Number(formData.age) || 10,
          month: "March",
          year: selectedYear,
          dueAmount,
          sessionsCompleted: 0,
          sessionsRemaining: formData.totalSessions,
        },
        {
          branchId: targetBranchId,
          branchName: targetBranchName,
          employeeId: "ADM001",
          employeeName: "Super Admin",
        }
      );
    }
    setStudents(kidsService.getSnapshot1on1());
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Users className="w-3.5 h-3.5" />
              <span>{filteredStudents.length} Records</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Personalized one-on-one junior training sessions and slot bookings.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Kids_Coaching_1on1"
            moduleTitle="Kids Coaching 1-1 Registry"
            subtitle={`Branch: ${selectedBranch === "all" ? "All Branches" : selectedBranch}`}
            columns={EXPORT_COLUMNS}
            currentViewData={filteredStudents}
            selectedData={selectedStudents}
            entireModuleData={students}
          />
          <Button
            onClick={handleOpenAdd}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add 1-1 Student</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">1-1 Enrolled</p>
              <h3 className="text-xl font-bold text-slate-900">{metrics.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Squad</p>
              <h3 className="text-xl font-bold text-emerald-600">{metrics.active}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Sessions Delivered</p>
              <h3 className="text-xl font-bold text-indigo-600">{metrics.completedSessions}</h3>
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
          placeholder="Search by parent mobile number..."
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
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Serial No</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Student Name</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Parent Details</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Branch</th>
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
                {filteredStudents.map((s) => {
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
                        #{s.serialNumber}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {s.studentName} ({s.age}y, {s.gender})
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{s.parentName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{s.parentMobile}</div>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {s.branchName || "Nallagandla"}
                        </span>
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
                        <span className="text-blue-600">{s.sessionsCompleted}</span>
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
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

      {/* Details Drawer */}
      {viewingStudent && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingStudent(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {viewingStudent.studentName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{viewingStudent.studentName}</h2>
                  <p className="text-xs text-slate-400 font-mono">{viewingStudent.studentId}</p>
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

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Parent:</span><span className="font-semibold text-slate-800">{viewingStudent.parentName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mobile:</span><span className="font-mono font-semibold text-slate-800">{viewingStudent.parentMobile}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Branch:</span><span className="font-semibold text-slate-800">{viewingStudent.branchName || "Nallagandla"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Coach:</span><span className="font-semibold text-slate-800">{viewingStudent.coach}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Slot:</span><span className="font-semibold text-slate-800">{viewingStudent.preferredTiming}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Package:</span><span className="font-semibold text-slate-800">{viewingStudent.sessionPackage}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Sessions Completed:</span><span className="font-semibold text-blue-600">{viewingStudent.sessionsCompleted} / {viewingStudent.totalSessions}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Fee Amount:</span><span className="font-semibold text-slate-800">₹{viewingStudent.feeAmount}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Paid:</span><span className="font-semibold text-emerald-600">₹{viewingStudent.amountPaid}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Due:</span><span className="font-semibold text-rose-600">₹{viewingStudent.dueAmount}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-500">Payment Method:</span><PaymentMethodBadge method={viewingStudent.paymentMethod} /></div>
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
                  {studentToEdit ? "Edit 1-1 Student" : "Register 1-1 Student"}
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
                    <Label className="text-xs">Student Name</Label>
                    <Input
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      required
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Parent Name</Label>
                    <Input
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      required
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Parent Mobile</Label>
                    <Input
                      value={formData.parentMobile}
                      onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                      required
                      className="h-9 mt-1 text-xs font-mono"
                    />
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
                  <div>
                    <Label className="text-xs">Session Package</Label>
                    <select
                      value={formData.sessionPackage}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          sessionPackage: e.target.value,
                        });
                      }}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                    >
                      {SESSION_PACKAGES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Amount Paid (₹)</Label>
                    <Input
                      type="number"
                      value={formData.amountPaid === ("" as unknown) ? "" : formData.amountPaid}
                      onChange={(e) => {
                        const val = e.target.value;
                        const paid = val === "" ? ("" as unknown as number) : Math.max(0, parseInt(val, 10) || 0);
                        const numFee = Number(formData.feeAmount) || 0;
                        const numPaid = Number(paid) || 0;
                        const due = numFee - numPaid;
                        setFormData({
                          ...formData,
                          amountPaid: paid,
                          paymentStatus: due <= 0 ? "Paid" : numPaid > 0 ? "Partial" : "Pending",
                        });
                      }}
                      placeholder="e.g. 2500"
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Payment Method</Label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                      className="w-full h-9 mt-1 rounded-lg border border-slate-200 px-2.5 text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
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
                  <Button type="submit" className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                    {studentToEdit ? "Update Student" : "Save Student"}
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
