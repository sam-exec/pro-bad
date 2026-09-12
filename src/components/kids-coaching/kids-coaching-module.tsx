"use client";

import React, { useState, useMemo } from "react";
import { Plus, Users, Award, DollarSign } from "lucide-react";
import { Student, StudentFormData } from "@/types/kids-coaching";
import { INITIAL_KIDS_STUDENTS } from "@/data/kids-coaching-mock";
import { SearchBar } from "./search-bar";
import { MonthFilter } from "./month-filter";
import { StudentTable } from "./student-table";
import { StudentDetailsDrawer } from "./student-details-drawer";
import { StudentFormModal } from "./student-form-modal";
import { Button } from "@/components/ui/button";

export function KidsCoachingModule() {
  const [students, setStudents] = useState<Student[]>(INITIAL_KIDS_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Modal & Drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Filtered Students (instant phone search + month/year filters)
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
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

      return true;
    });
  }, [students, searchQuery, selectedMonth, selectedYear]);

  // Summary Metrics for current view
  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const active = filteredStudents.filter((s) => s.status === "Active").length;
    const totalCollected = filteredStudents.reduce((acc, s) => acc + s.amountPaid, 0);
    const totalDue = filteredStudents.reduce((acc, s) => acc + s.dueAmount, 0);
    return { total, active, totalCollected, totalDue };
  }, [filteredStudents]);

  // Add / Edit Handlers
  const handleSaveStudent = (formData: StudentFormData, studentIdToEdit?: string) => {
    const dueAmount = Math.max(0, formData.monthlyFee - formData.amountPaid);
    const paymentStatus =
      dueAmount === 0 && formData.amountPaid > 0
        ? "Paid"
        : formData.amountPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";

    const timestamp = new Date().toISOString();

    if (studentIdToEdit) {
      // Edit existing
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentIdToEdit) {
            return {
              ...s,
              ...formData,
              dueAmount,
              paymentStatus,
              updatedAt: timestamp,
              lastModifiedBy: "EMP-1042",
            };
          }
          return s;
        })
      );
      // Update drawer if currently viewing
      if (viewingStudent?.id === studentIdToEdit) {
        setViewingStudent((prev) =>
          prev
            ? {
                ...prev,
                ...formData,
                dueAmount,
                paymentStatus,
                updatedAt: timestamp,
                lastModifiedBy: "EMP-1042",
              }
            : null
        );
      }
    } else {
      // Add new student
      const nextCount = students.length + 1;
      const formattedId = `KC-2026-${String(nextCount).padStart(3, "0")}`;
      const newStudent: Student = {
        ...formData,
        id: `kc-${Date.now()}`,
        studentId: formattedId,
        dueAmount,
        paymentStatus,
        createdBy: "EMP-1042",
        createdAt: timestamp,
        updatedAt: timestamp,
        lastModifiedBy: "EMP-1042",
      };
      setStudents((prev) => [newStudent, ...prev]);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kids Coaching
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all Kids Coaching students.
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

        {/* Right: Month/Year Filters & Add Student Button */}
        <div className="flex flex-wrap items-center gap-2.5">
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

      {/* Active Filter Indicator if Search or Month is active */}
      {(searchQuery || selectedMonth !== "All") && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
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
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedMonth("All");
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
