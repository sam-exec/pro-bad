"use client";

import React, { useState, useMemo } from "react";
import { Plus, Users, Award } from "lucide-react";
import { Student, StudentFormData } from "@/types/kids-coaching";
import { PaymentMethod } from "@/types/payment";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { kidsService } from "@/services/excel";
import { SearchBar } from "./search-bar";
import { MonthFilter } from "./month-filter";
import { StudentTable } from "./student-table";
import { StudentDetailsDrawer } from "./student-details-drawer";
import { StudentFormModal } from "./student-form-modal";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/context/branch-context";

export function KidsCoachingModule() {
  const { currentBranch, employeeId, employeeName } = useBranch();
  const [students, setStudents] = useState<Student[]>(() => kidsService.getSnapshot());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");

  // Modal & Drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Filtered Students (Branch Isolation + phone search + month/year filters + payment method filter)
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Data Isolation: only show records belonging to current branch
      if (student.branchId && student.branchId !== currentBranch.id) {
        return false;
      }

      // Search by Mobile Number
      if (searchQuery.trim()) {
        const cleanQuery = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = student.mobileNumber.replace(/\D/g, "");
        if (!cleanPhone.includes(cleanQuery)) {
          return false;
        }
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
  }, [students, currentBranch.id, searchQuery, selectedMonth, selectedYear, paymentMethodFilter]);

  // Summary Metrics for current branch view
  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const active = filteredStudents.filter((s) => s.status === "Active").length;
    const totalCollected = filteredStudents.reduce((acc, s) => acc + s.amountPaid, 0);
    const totalDue = filteredStudents.reduce((acc, s) => acc + s.dueAmount, 0);
    return { total, active, totalCollected, totalDue };
  }, [filteredStudents]);

  // Add / Edit Handlers via kidsService layer
  const handleSaveStudent = async (formData: StudentFormData, studentIdToEdit?: string) => {
    const dueAmount = Math.max(0, formData.monthlyFee - formData.amountPaid);
    const paymentStatus =
      dueAmount === 0 && formData.amountPaid > 0
        ? "Paid"
        : formData.amountPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";

    if (studentIdToEdit) {
      // Update through kidsService layer
      const updated = await kidsService.update(
        studentIdToEdit,
        {
          ...formData,
          dueAmount,
          paymentStatus,
        },
        employeeId
      );

      setStudents((prev) =>
        prev.map((s) => (s.id === studentIdToEdit ? updated : s))
      );
      if (viewingStudent?.id === studentIdToEdit) {
        setViewingStudent(updated);
      }
    } else {
      // Create through kidsService layer
      const created = await kidsService.create(formData, {
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        employeeId,
        employeeName,
      });

      setStudents((prev) => [created, ...prev]);
    }
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              📍 {currentBranch.name}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage Kids Coaching students for <span className="font-semibold text-slate-700">{currentBranch.name} Branch</span>.
          </p>
        </div>

        {/* Quick stat chips */}
        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-2xs">
            Students: <strong className="text-slate-900">{metrics.total}</strong> ({metrics.active} active)
          </span>
          <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium shadow-2xs">
            Collected: <strong className="ml-1">₹{metrics.totalCollected}</strong>
          </span>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Left: Search Student by Mobile Number */}
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Mobile Number (e.g. 9876543210)..."
          />
        </div>

        {/* Right: Month/Year Filters, Payment Method Filter & Add Student Button */}
        <div className="flex flex-wrap items-center gap-2.5">
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

          <Button
            onClick={handleOpenAdd}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* Active Filter Indicator if Search, Month or Method is active */}
      {(searchQuery || selectedMonth !== "All" || paymentMethodFilter !== "all") && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Filtering by:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Phone: {searchQuery}
              </span>
            )}
            {selectedMonth !== "All" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Month: {selectedMonth}
              </span>
            )}
            {paymentMethodFilter !== "all" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Method: {paymentMethodFilter}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedMonth("All");
              setPaymentMethodFilter("all");
            }}
            className="text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Student Table & Mobile Cards */}
      <StudentTable
        students={filteredStudents}
        onView={(student) => setViewingStudent(student)}
        onEdit={handleOpenEdit}
        onAddNew={handleOpenAdd}
      />

      {/* Student Details Drawer */}
      <StudentDetailsDrawer
        student={viewingStudent}
        isOpen={Boolean(viewingStudent)}
        onClose={() => setViewingStudent(null)}
        onEdit={handleOpenEdit}
      />

      {/* Add / Edit Student Modal */}
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
