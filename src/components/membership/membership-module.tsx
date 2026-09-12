"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { MembershipRecord } from "@/types/membership";
import { INITIAL_MEMBERSHIP_RECORDS } from "@/data/membership-mock";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { MonthFilter } from "@/components/kids-coaching/month-filter";
import { MembershipTable } from "./membership-table";
import { MembershipDetailsDrawer } from "./membership-details-drawer";
import { MembershipFormModal } from "./membership-form-modal";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/context/branch-context";

export function MembershipModule() {
  const { currentBranch, employeeId, employeeName } = useBranch();
  const [memberships, setMemberships] = useState<MembershipRecord[]>(
    INITIAL_MEMBERSHIP_RECORDS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Modal & Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [membershipToEdit, setMembershipToEdit] = useState<MembershipRecord | null>(
    null
  );
  const [viewingMembership, setViewingMembership] = useState<MembershipRecord | null>(
    null
  );

  // Filter logic: Search by Primary Mobile + Branch Isolation + Month/Year
  const filteredMemberships = useMemo(() => {
    return memberships.filter((m) => {
      // Branch Isolation
      if (m.branchId && m.branchId !== currentBranch.id) {
        return false;
      }

      // Primary mobile search
      if (searchQuery.trim()) {
        const cleanQuery = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = m.primaryMobileNumber.replace(/\D/g, "");
        if (!cleanPhone.includes(cleanQuery)) {
          return false;
        }
      }

      // Month filter
      if (selectedMonth !== "All" && m.currentMonth !== selectedMonth) {
        return false;
      }

      // Year filter
      if (m.year !== selectedYear) {
        return false;
      }

      return true;
    });
  }, [memberships, currentBranch.id, searchQuery, selectedMonth, selectedYear]);

  // Aggregate stats
  const metrics = useMemo(() => {
    const totalAccounts = filteredMemberships.length;
    const totalPeople = filteredMemberships.reduce(
      (acc, m) => acc + 1 + (m.additionalMembers?.length || 0),
      0
    );
    const totalCollected = filteredMemberships.reduce(
      (acc, m) => acc + m.amountPaid,
      0
    );
    return { totalAccounts, totalPeople, totalCollected };
  }, [filteredMemberships]);

  // Save / Update Handler
  const handleSaveMembership = (
    data: Partial<MembershipRecord>,
    idToEdit?: string
  ) => {
    const now = new Date().toISOString();

    if (idToEdit) {
      setMemberships((prev) =>
        prev.map((item) => {
          if (item.id === idToEdit) {
            const updated: MembershipRecord = {
              ...item,
              ...data,
              updatedAt: now,
              lastModifiedBy: employeeId,
            } as MembershipRecord;
            return updated;
          }
          return item;
        })
      );

      if (viewingMembership?.id === idToEdit) {
        setViewingMembership((prev) =>
          prev
            ? ({
                ...prev,
                ...data,
                updatedAt: now,
                lastModifiedBy: employeeId,
              } as MembershipRecord)
            : null
        );
      }
    } else {
      const nextCount = memberships.length + 1;
      const newRecord: MembershipRecord = {
        id: `mem-${Date.now()}`,
        recordId: `REC-MEM-${String(nextCount).padStart(3, "0")}`,
        membershipId: `MEM-2026-${String(nextCount).padStart(3, "0")}`,
        primaryMemberName: data.primaryMemberName || "",
        primaryMobileNumber: data.primaryMobileNumber || "",
        email: data.email,
        address: data.address || "",
        membershipPlan: data.membershipPlan || "Yearly Family Club Pack",
        joiningDate: data.joiningDate || new Date().toISOString().split("T")[0],
        expiryDate: data.expiryDate || "2026-12-31",
        monthlyFee: data.monthlyFee || 0,
        amountPaid: data.amountPaid || 0,
        dueAmount: data.dueAmount || 0,
        paymentStatus: data.paymentStatus || "Paid",
        status: data.status || "Active",
        remarks: data.remarks,
        currentMonth: data.currentMonth || "March",
        year: 2026,
        additionalMembers: data.additionalMembers || [],
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        employeeId: employeeId,
        employeeName: employeeName,
        createdBy: employeeId,
        createdAt: now,
        updatedAt: now,
        lastModifiedBy: employeeId,
      };

      setMemberships((prev) => [newRecord, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Membership
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              📍 {currentBranch.name}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage memberships and linked family members at <span className="font-semibold text-slate-700">{currentBranch.name} Branch</span>.
          </p>
        </div>

        {/* Quick Stat Chips */}
        <div className="flex items-center gap-2.5 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-2xs">
            Accounts: <strong className="text-slate-900">{metrics.totalAccounts}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium shadow-2xs">
            Total Members: <strong className="text-indigo-950">{metrics.totalPeople}</strong>
          </span>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Primary Member Phone (e.g. 9876543210)..."
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
              setMembershipToEdit(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Membership</span>
          </Button>
        </div>
      </div>

      {/* Filter Reset Indicator */}
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

      {/* Membership Table & Mobile Cards */}
      <MembershipTable
        memberships={filteredMemberships}
        onView={(record) => setViewingMembership(record)}
        onEdit={(record) => {
          setMembershipToEdit(record);
          setIsFormOpen(true);
        }}
        onAddNew={() => {
          setMembershipToEdit(null);
          setIsFormOpen(true);
        }}
      />

      {/* View Drawer */}
      <MembershipDetailsDrawer
        membership={viewingMembership}
        isOpen={Boolean(viewingMembership)}
        onClose={() => setViewingMembership(null)}
        onEdit={(record) => {
          setMembershipToEdit(record);
          setIsFormOpen(true);
        }}
      />

      {/* Add / Edit Form Modal */}
      <MembershipFormModal
        isOpen={isFormOpen}
        membershipToEdit={membershipToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setMembershipToEdit(null);
        }}
        onSave={handleSaveMembership}
      />
    </div>
  );
}
