"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Eye,
  X,
  Phone,
  Calendar,
  Building2,
  UserCheck,
  Dumbbell,
  Target,
  Heart,
  Filter,
} from "lucide-react";
import { INITIAL_KIDS_STUDENTS } from "@/data/kids-coaching-mock";
import {
  INITIAL_KIDS_1ON1_STUDENTS,
  INITIAL_ADULTS_COACHING_MEMBERS,
  INITIAL_ADULTS_1ON1_MEMBERS,
} from "@/data/coaching-modules-mock";
import { INITIAL_SUPER_MOMS_RECORDS } from "@/data/super-moms-mock";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { BRANCHES } from "@/config/branches";
import { MONTHS } from "@/types/kids-coaching";
import { cn } from "@/lib/utils";

interface UnifiedStudentRow {
  id: string;
  name: string;
  phone: string;
  category:
    | "Kids Coaching"
    | "Kids Coaching 1-1"
    | "Adults Coaching"
    | "Adults Coaching 1-1"
    | "Super Moms";
  coach: string;
  branchId: string;
  branchName: string;
  status: "Active" | "Inactive" | "Trial";
  joiningDate: string;
  feeAmount: number;
  paidAmount: number;
  month: string;
  extraInfo?: string;
}

interface AdminStudentsProps {
  selectedBranch: string;
}

export function AdminStudents({ selectedBranch }: AdminStudentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [monthFilter, setMonthFilter] = useState<string>("All");
  const [viewingStudent, setViewingStudent] =
    useState<UnifiedStudentRow | null>(null);

  // Combine all coaching datasets into a unified list
  const allStudents = useMemo<UnifiedStudentRow[]>(() => {
    const list: UnifiedStudentRow[] = [];

    // 1. Kids Coaching
    INITIAL_KIDS_STUDENTS.forEach((s) => {
      list.push({
        id: s.id,
        name: s.studentName,
        phone: s.mobileNumber,
        category: "Kids Coaching",
        coach: s.coach,
        branchId: s.branchId,
        branchName: s.branchName,
        status: s.status,
        joiningDate: s.joiningDate,
        feeAmount: s.monthlyFee,
        paidAmount: s.amountPaid,
        month: s.currentMonth,
        extraInfo: `Age: ${s.age}, Parent: ${s.parentName}, Batch: ${s.batch}`,
      });
    });

    // 2. Kids Coaching 1-1
    INITIAL_KIDS_1ON1_STUDENTS.forEach((s) => {
      list.push({
        id: s.id,
        name: s.studentName,
        phone: s.parentMobile,
        category: "Kids Coaching 1-1",
        coach: s.coach,
        branchId: s.branchId,
        branchName: s.branchName,
        status: s.status,
        joiningDate: s.joiningDate,
        feeAmount: s.feeAmount,
        paidAmount: s.amountPaid,
        month: s.month,
        extraInfo: `Timing: ${s.preferredTiming}, Sessions: ${s.sessionsCompleted}/${s.totalSessions}`,
      });
    });

    // 3. Adults Coaching
    INITIAL_ADULTS_COACHING_MEMBERS.forEach((s) => {
      list.push({
        id: s.id,
        name: s.memberName,
        phone: s.mobileNumber,
        category: "Adults Coaching",
        coach: s.coach,
        branchId: s.branchId,
        branchName: s.branchName,
        status: s.status,
        joiningDate: s.joiningDate,
        feeAmount: s.monthlyFee,
        paidAmount: s.paidAmount,
        month: s.currentMonth,
        extraInfo: `Age: ${s.age}, Batch: ${s.batch}`,
      });
    });

    // 4. Adults Coaching 1-1
    INITIAL_ADULTS_1ON1_MEMBERS.forEach((s) => {
      list.push({
        id: s.id,
        name: s.memberName,
        phone: s.mobileNumber,
        category: "Adults Coaching 1-1",
        coach: s.coach,
        branchId: s.branchId,
        branchName: s.branchName,
        status: s.status,
        joiningDate: s.joiningDate,
        feeAmount: s.feeAmount,
        paidAmount: s.paidAmount,
        month: s.month,
        extraInfo: `Timing: ${s.preferredTiming}, Package: ${s.sessionPackage}`,
      });
    });

    // 5. Super Moms
    INITIAL_SUPER_MOMS_RECORDS.forEach((s) => {
      list.push({
        id: s.id,
        name: s.memberName,
        phone: s.mobileNumber,
        category: "Super Moms",
        coach: s.coach,
        branchId: s.branchId,
        branchName: s.branchName,
        status: s.status,
        joiningDate: s.joiningDate,
        feeAmount: s.monthlyFee,
        paidAmount: s.amountPaid,
        month: "March",
        extraInfo: `Batch: ${s.batch}`,
      });
    });

    return list;
  }, []);

  // Filtered logic
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      // 1. Header Branch Selector constraint
      if (selectedBranch !== "all" && s.branchId !== selectedBranch) {
        return false;
      }

      // 2. In-page Branch Filter
      if (branchFilter !== "All" && s.branchId !== branchFilter) {
        return false;
      }

      // 3. Category Filter
      if (categoryFilter !== "All" && s.category !== categoryFilter) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter !== "All" && s.status !== statusFilter) {
        return false;
      }

      // 5. Month Filter
      if (monthFilter !== "All" && s.month !== monthFilter) {
        return false;
      }

      // 6. Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchPhone = s.phone.includes(q.replace(/\D/g, ""));
        const matchCoach = s.coach.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCoach) {
          return false;
        }
      }

      return true;
    });
  }, [
    allStudents,
    selectedBranch,
    branchFilter,
    categoryFilter,
    statusFilter,
    monthFilter,
    searchQuery,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Students & Coaching Registry
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{filteredStudents.length} Students</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Consolidated directory of all junior and adult coaching programs across branches.
          </p>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by student name, phone, or coach..."
          />

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Branch */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Categories</option>
              <option value="Kids Coaching">Kids Coaching</option>
              <option value="Kids Coaching 1-1">Kids Coaching 1-1</option>
              <option value="Adults Coaching">Adults Coaching</option>
              <option value="Adults Coaching 1-1">Adults Coaching 1-1</option>
              <option value="Super Moms">Super Moms</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Trial">Trial</option>
            </select>

            {/* Month */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Months</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Assigned Coach</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No student coaching records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={`${student.category}-${student.id}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {student.phone}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {student.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {student.coach}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border",
                          student.branchId === "branch-mnk"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {student.branchName}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                          student.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : student.status === "Trial"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            student.status === "Active"
                              ? "bg-emerald-500"
                              : student.status === "Trial"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          )}
                        />
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {student.joiningDate}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingStudent(student)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Drawer */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {viewingStudent.name}
                </h3>
                <span className="text-xs font-semibold text-indigo-600">
                  {viewingStudent.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 text-sm">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Coaching Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Coach
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {viewingStudent.coach}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Branch
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {viewingStudent.branchName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Financials
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Monthly/Package Fee:</span>
                    <span className="font-bold text-slate-900">
                      ₹{viewingStudent.feeAmount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-600">
                      ₹{viewingStudent.paidAmount}
                    </span>
                  </div>
                </div>
              </div>

              {viewingStudent.extraInfo && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Batch & Program Info
                  </h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {viewingStudent.extraInfo}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
