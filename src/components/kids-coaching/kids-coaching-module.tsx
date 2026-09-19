"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Users, Award, DollarSign, Clock, Eye, Edit2 } from "lucide-react";
import { Student, StudentFormData } from "@/types/kids-coaching";
import { PaymentMethod } from "@/types/payment";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { PaymentBadge } from "./payment-badge";
import { StatusBadge } from "./status-badge";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { kidsService } from "@/services/excel";
import { UniversalSearch } from "@/components/ui/universal-search";
import { universalMatch } from "@/lib/search";
import { MonthFilter } from "./month-filter";
import { StudentDetailsDrawer } from "./student-details-drawer";
import { StudentFormModal } from "./student-form-modal";
import { Button } from "@/components/ui/button";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";
import { useAuth } from "@/context/auth-context";

const EXPORT_COLUMNS: ExportColumn<Student>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (_r, idx) => `#${idx + 1}` },
  { header: "Student Name", key: "studentName" },
  { header: "Parent Name", key: "parentName" },
  { header: "Mobile Number", key: "mobileNumber" },
  { header: "Age", key: "age" },
  { header: "Gender", key: "gender" },
  { header: "Batch", key: "batch" },
  { header: "Coach", key: "coach" },
  { header: "Monthly Fee", key: "monthlyFee", formatter: (r) => `₹${r.monthlyFee}` },
  { header: "Amount Paid", key: "amountPaid", formatter: (r) => `₹${r.amountPaid}` },
  { header: "Due Amount", key: "dueAmount", formatter: (r) => `₹${r.dueAmount}` },
  { header: "Payment Method", key: "paymentMethod" },
  { header: "Payment Status", key: "paymentStatus" },
  { header: "Month", key: "currentMonth", formatter: (r) => `${r.currentMonth} ${r.year}` },
  { header: "Status", key: "status" },
  { header: "Joining Date", key: "joiningDate" },
];

export function KidsCoachingModule() {
  const { employeeId, employeeName } = useAuth();
  const [students, setStudents] = useState<Student[]>(() => kidsService.getSnapshot());

  useEffect(() => {
    const handleUpdate = () => setStudents(kidsService.getSnapshot());
    window.addEventListener("excel-data-updated", handleUpdate);
    return () => window.removeEventListener("excel-data-updated", handleUpdate);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal & Drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Universal Search
      if (searchQuery.trim() && !universalMatch(student, searchQuery)) {
        return false;
      }

      // Filter by Month
      if (selectedMonth !== "All" && student.currentMonth !== selectedMonth) {
        return false;
      }

      // Filter by Year
      if (student.year !== selectedYear) {
        return false;
      }

      // Filter by Payment Method
      if (paymentMethodFilter !== "all" && student.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      return true;
    });
  }, [students, searchQuery, selectedMonth, selectedYear, paymentMethodFilter]);

  // Selected students for export
  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  // Selection handlers
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
      const currentIds = new Set(filteredStudents.map((s) => s.id));
      setSelectedIds((prev) => prev.filter((id) => !currentIds.has(id)));
    } else {
      const currentIds = filteredStudents.map((s) => s.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const paidCount = filteredStudents.filter((s) => s.paymentStatus === "Paid").length;
    const totalDue = filteredStudents.reduce((sum, s) => sum + s.dueAmount, 0);
    const activeCount = filteredStudents.filter((s) => s.status === "Active").length;
    return { total, paidCount, totalDue, activeCount };
  }, [filteredStudents]);

  // Dynamic serial number for drawer
  const viewingSerialNumber = useMemo(() => {
    if (!viewingStudent) return undefined;
    const index = filteredStudents.findIndex((s) => s.id === viewingStudent.id);
    return index >= 0 ? index + 1 : undefined;
  }, [viewingStudent, filteredStudents]);

  // Save / Edit Handlers
  const handleSaveStudent = async (formData: StudentFormData, studentIdToEdit?: string) => {
    const dueAmount = Math.max(0, formData.monthlyFee - formData.amountPaid);
    const paymentStatus =
      dueAmount === 0 && formData.amountPaid > 0
        ? "Paid"
        : formData.amountPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";

    if (studentIdToEdit) {
      const updated = await kidsService.update(
        studentIdToEdit,
        {
          ...formData,
          dueAmount,
          paymentStatus,
        },
        employeeId
      );

      if (viewingStudent?.id === studentIdToEdit) {
        setViewingStudent(updated);
      }
    } else {
      await kidsService.create(formData, {
        employeeId,
        employeeName,
      });
    }
    setIsFormOpen(false);
    setStudentToEdit(null);
  };

  const handleOpenAdd = () => {
    setStudentToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setStudentToEdit(student);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kids Coaching
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Users className="w-3.5 h-3.5" />
              <span>{filteredStudents.length} Records</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Group coaching registry for junior badminton learners.
          </p>
        </div>

        {/* Action Buttons: Export + Add Student */}
        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Kids_Coaching"
            moduleTitle="Kids Coaching Registry"
            subtitle="Facility Student Registry"
            columns={EXPORT_COLUMNS}
            currentViewData={filteredStudents}
            selectedData={selectedStudents}
            entireModuleData={students}
          />
          <Button
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* 1. Standardized 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Students
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Filtered coaching roster
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Enrolled */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Enrolled
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              {metrics.activeCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Regular batch attendees
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Fees Settled */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Fees Settled
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 mt-1 block">
              {metrics.paidCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              No outstanding balance
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Outstanding Dues
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
              ₹{metrics.totalDue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Pending fee recovery
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
      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No student records found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or month filter.
          </p>
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
                  <th className="px-3.5 py-3 whitespace-nowrap">Parent Name</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Mobile</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Age/Gender</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Batch</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Monthly Fee</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Due</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredStudents.map((student, index) => {
                  const isChecked = selectedIds.includes(student.id);
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors text-xs text-slate-700 ${
                        isChecked ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(student.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3.5 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        #{index + 1}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {student.studentName}
                      </td>
                      <td className="px-3.5 py-3 text-slate-500 whitespace-nowrap">
                        {student.parentName}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {student.mobileNumber}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        {student.age} yrs • {student.gender}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap max-w-[150px] truncate" title={student.batch}>
                        {student.batch}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-slate-800">
                        {student.coach}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ₹{student.monthlyFee}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        ₹{student.amountPaid}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                        ₹{student.dueAmount}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentMethodBadge method={student.paymentMethod} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentBadge status={student.paymentStatus} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Student"
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

      {/* Slide-over Drawer */}
      <StudentDetailsDrawer
        student={viewingStudent}
        serialNumber={viewingSerialNumber}
        isOpen={Boolean(viewingStudent)}
        onClose={() => setViewingStudent(null)}
        onEdit={(student) => {
          setViewingStudent(null);
          handleOpenEdit(student);
        }}
      />

      {/* Add / Edit Form Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        studentToEdit={studentToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
      />
    </div>
  );
}
