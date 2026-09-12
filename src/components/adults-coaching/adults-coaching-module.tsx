"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Users,
  Eye,
  Edit2,
  X,
  Phone,
  Calendar,
} from "lucide-react";
import {
  AdultCoachMember,
  ADULT_BATCHES,
} from "@/types/coaching-modules";
import { COACHES, MONTHS, YEARS, Gender, StudentStatus } from "@/types/kids-coaching";
import { INITIAL_ADULTS_COACHING_MEMBERS } from "@/data/coaching-modules-mock";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { MonthFilter } from "@/components/kids-coaching/month-filter";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentBadge } from "@/components/kids-coaching/payment-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useBranch } from "@/context/branch-context";

export function AdultsCoachingModule() {
  const { currentBranch, employeeId, employeeName } = useBranch();
  const [members, setMembers] = useState<AdultCoachMember[]>(INITIAL_ADULTS_COACHING_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Drawer and Modal States
  const [viewingMember, setViewingMember] = useState<AdultCoachMember | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<AdultCoachMember | null>(null);

  // Form Fields
  const [memberName, setMemberName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<Gender>("Male");
  const [joiningDate, setJoiningDate] = useState("2026-03-01");
  const [batch, setBatch] = useState<string>(ADULT_BATCHES[0]);
  const [coach, setCoach] = useState<string>(COACHES[0]);
  const [monthlyFee, setMonthlyFee] = useState<number>(200);
  const [paidAmount, setPaidAmount] = useState<number>(200);
  const [currentMonth, setCurrentMonth] = useState<string>("March");
  const [status, setStatus] = useState<StudentStatus>("Active");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (memberToEdit) {
      setMemberName(memberToEdit.memberName);
      setMobileNumber(memberToEdit.mobileNumber);
      setAge(memberToEdit.age);
      setGender(memberToEdit.gender);
      setJoiningDate(memberToEdit.joiningDate);
      setBatch(memberToEdit.batch);
      setCoach(memberToEdit.coach);
      setMonthlyFee(memberToEdit.monthlyFee);
      setPaidAmount(memberToEdit.paidAmount);
      setCurrentMonth(memberToEdit.currentMonth);
      setStatus(memberToEdit.status);
      setRemarks(memberToEdit.remarks || "");
    } else {
      setMemberName("");
      setMobileNumber("");
      setAge(30);
      setGender("Male");
      setJoiningDate(new Date().toISOString().split("T")[0]);
      setBatch(ADULT_BATCHES[0]);
      setCoach(COACHES[0]);
      setMonthlyFee(200);
      setPaidAmount(200);
      setCurrentMonth("March");
      setStatus("Active");
      setRemarks("");
    }
    setErrors({});
  }, [memberToEdit, isFormOpen]);

  // Search by Mobile Number + Branch Isolation
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (m.branchId && m.branchId !== currentBranch.id) return false;
      if (searchQuery.trim()) {
        const cleanQuery = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = m.mobileNumber.replace(/\D/g, "");
        if (!cleanPhone.includes(cleanQuery)) return false;
      }
      if (selectedMonth !== "All" && m.currentMonth !== selectedMonth) return false;
      if (m.year !== selectedYear) return false;
      return true;
    });
  }, [members, currentBranch.id, searchQuery, selectedMonth, selectedYear]);

  // Save / Edit Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!memberName.trim()) newErrors.memberName = "Member name is required.";
    if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber.replace(/\D/g, ""))) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }
    if (age <= 16) newErrors.age = "Adult members must be 16+.";
    if (monthlyFee < 0) newErrors.monthlyFee = "Fee cannot be negative.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dueAmount = Math.max(0, monthlyFee - paidAmount);
    const paymentStatus =
      dueAmount === 0 && paidAmount > 0
        ? "Paid"
        : paidAmount > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";
    const now = new Date().toISOString();

    if (memberToEdit) {
      setMembers((prev) =>
        prev.map((item) => {
          if (item.id === memberToEdit.id) {
            const updated: AdultCoachMember = {
              ...item,
              memberName: memberName.trim(),
              mobileNumber: mobileNumber.trim(),
              age: Number(age),
              gender,
              joiningDate,
              batch,
              coach,
              monthlyFee: Number(monthlyFee),
              paidAmount: Number(paidAmount),
              dueAmount,
              paymentStatus,
              currentMonth,
              status,
              remarks: remarks.trim(),
              updatedAt: now,
              lastModifiedBy: employeeId,
            };
            return updated;
          }
          return item;
        })
      );
      if (viewingMember?.id === memberToEdit.id) {
        setViewingMember((prev) =>
          prev
            ? {
                ...prev,
                memberName: memberName.trim(),
                mobileNumber: mobileNumber.trim(),
                age: Number(age),
                gender,
                joiningDate,
                batch,
                coach,
                monthlyFee: Number(monthlyFee),
                paidAmount: Number(paidAmount),
                dueAmount,
                paymentStatus,
                currentMonth,
                status,
                remarks: remarks.trim(),
                updatedAt: now,
                lastModifiedBy: employeeId,
              }
            : null
        );
      }
    } else {
      const nextCount = members.length + 1;
      const newMember: AdultCoachMember = {
        id: `ac-${Date.now()}`,
        recordId: `REC-AC-${String(nextCount).padStart(3, "0")}`,
        memberId: `AC-2026-${String(nextCount).padStart(3, "0")}`,
        memberName: memberName.trim(),
        mobileNumber: mobileNumber.trim(),
        age: Number(age),
        gender,
        joiningDate,
        batch,
        coach,
        monthlyFee: Number(monthlyFee),
        paidAmount: Number(paidAmount),
        dueAmount,
        paymentStatus,
        currentMonth,
        year: 2026,
        status,
        remarks: remarks.trim(),
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        employeeId: employeeId,
        employeeName: employeeName,
        createdBy: employeeId,
        createdAt: now,
        updatedAt: now,
        lastModifiedBy: employeeId,
      };
      setMembers((prev) => [newMember, ...prev]);
    }

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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              📍 {currentBranch.name}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage adult coaching members at <span className="font-semibold text-slate-700">{currentBranch.name} Branch</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-2xs">
            Adult Members: <strong className="text-slate-900">{filteredMembers.length}</strong>
          </span>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Mobile Number (e.g. 98881)..."
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
              setMemberToEdit(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No members found.</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1.5 mb-6">
            No adult members match the selected filters.
          </p>
          <Button
            onClick={() => {
              setMemberToEdit(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Table View (16 columns) */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-280px)] scrollbar-thin">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
                  <tr>
                    <th className="px-3.5 py-3 whitespace-nowrap">Member ID</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Member Name</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Mobile Number</th>
                    <th className="px-3.5 py-3 text-center whitespace-nowrap">Age</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Gender</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Batch</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Coach</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">Monthly Fee</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid Amount</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">Due Amount</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Payment</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Month</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                    <th className="px-3.5 py-3 whitespace-nowrap">Last Updated</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {m.memberId}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {m.memberName}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {m.mobileNumber}
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        {m.age}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        {m.gender}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                        {m.joiningDate}
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
                        <PaymentBadge status={m.paymentStatus} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-600">
                        {m.currentMonth} {m.year}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                        {new Date(m.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingMember(m)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
            {filteredMembers.map((m) => (
              <Card key={m.id} className="border-slate-200/90 bg-white shadow-xs rounded-xl overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{m.memberName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({m.age}y, {m.gender})</span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{m.memberId}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{m.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{m.currentMonth} {m.year}</span>
                    </div>
                    <div className="col-span-2 text-[11px] text-slate-500 truncate">
                      <span className="font-medium text-slate-700">Coach:</span> {m.coach} &bull; {m.batch}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <PaymentBadge status={m.paymentStatus} />
                      <span className="text-xs font-semibold text-slate-700">
                        ₹{m.paidAmount} {m.dueAmount > 0 && <span className="text-rose-600 ml-1">Due: ₹{m.dueAmount}</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingMember(m)}
                        className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMemberToEdit(m);
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
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{viewingMember.memberId}</p>
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
                  <div className="col-span-3 pt-2 flex items-center justify-between">
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

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mName" required>Member Name</Label>
                  <Input
                    id="mName"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    hasError={Boolean(errors.memberName)}
                  />
                  {errors.memberName && <p className="text-xs text-red-600">{errors.memberName}</p>}
                </div>
                <div>
                  <Label htmlFor="mPhone" required>Mobile Number</Label>
                  <Input
                    id="mPhone"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    maxLength={10}
                    hasError={Boolean(errors.mobileNumber)}
                  />
                  {errors.mobileNumber && <p className="text-xs text-red-600">{errors.mobileNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="mAge" required>Age</Label>
                    <Input
                      id="mAge"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                    />
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
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="mPaid" required>Paid Amount (₹)</Label>
                  <Input
                    id="mPaid"
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                  />
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
                    <option value="Trial">Trial</option>
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

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {memberToEdit ? "Update Member" : "Save Member"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
