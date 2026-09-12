"use client";

import React, { useState, useMemo } from "react";
import { Plus, Clock, Search, Filter } from "lucide-react";
import {
  FlexibleMembershipRecord,
  FlexibleStatus,
  calculateDaysRemaining,
  calculateExpiryDate,
  determineFlexibleStatus,
} from "@/types/flexible-membership";
import { INITIAL_FLEXIBLE_MEMBERSHIPS } from "@/data/flexible-membership-mock";
import { FlexibleDashboardCards } from "./flexible-dashboard-cards";
import { FlexibleMembershipTable } from "./flexible-membership-table";
import { FlexibleMembershipDrawer } from "./flexible-membership-drawer";
import { FlexibleMembershipModal } from "./flexible-membership-modal";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/context/branch-context";

export function FlexibleMembershipModule() {
  const { currentBranch, employeeId, employeeName } = useBranch();
  const [memberships, setMemberships] = useState<FlexibleMembershipRecord[]>(
    INITIAL_FLEXIBLE_MEMBERSHIPS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [expiryFilter, setExpiryFilter] = useState<string>("All");

  // Drawer and Modal States
  const [viewingMembership, setViewingMembership] =
    useState<FlexibleMembershipRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [membershipToEdit, setMembershipToEdit] =
    useState<FlexibleMembershipRecord | null>(null);

  // Filtering Logic: Branch Isolation + Search + Status + Expiry
  const filteredMemberships = useMemo(() => {
    return memberships.filter((m) => {
      // 0. Branch Isolation
      if (m.branchId && m.branchId !== currentBranch.id) {
        return false;
      }

      // 1. Search by primary phone number
      if (searchQuery.trim()) {
        const cleanQuery = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = m.primaryMobileNumber.replace(/\D/g, "");
        if (!cleanPhone.includes(cleanQuery)) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== "All" && m.status !== statusFilter) {
        return false;
      }

      // 3. Expiry Filter
      if (expiryFilter !== "All") {
        const daysLeft = calculateDaysRemaining(m.expiryDate);
        if (expiryFilter === "7days" && (daysLeft > 7 || daysLeft <= 0)) {
          return false;
        }
        if (expiryFilter === "15days" && (daysLeft > 15 || daysLeft <= 0)) {
          return false;
        }
        if (expiryFilter === "expired" && daysLeft > 0) {
          return false;
        }
      }

      return true;
    });
  }, [memberships, currentBranch.id, searchQuery, statusFilter, expiryFilter]);

  // Save / Update Handler
  const handleSave = (
    data: Partial<FlexibleMembershipRecord>,
    idToEdit?: string
  ) => {
    const now = new Date().toISOString();

    if (idToEdit) {
      setMemberships((prev) =>
        prev.map((item) => {
          if (item.id === idToEdit) {
            const updated: FlexibleMembershipRecord = {
              ...item,
              ...data,
              updatedAt: now,
              lastModifiedBy: employeeId,
            } as FlexibleMembershipRecord;
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
              } as FlexibleMembershipRecord)
            : null
        );
      }
    } else {
      const nextCount = memberships.length + 1;
      const join = data.joiningDate || new Date().toISOString().split("T")[0];
      const expiry = calculateExpiryDate(join, 45);
      const totalH = data.totalHours || 30;
      const usedH = data.hoursUsed || 0;
      const remainingH = Math.max(0, totalH - usedH);
      const computedStatus = determineFlexibleStatus(totalH, usedH, expiry);

      const newRecord: FlexibleMembershipRecord = {
        id: `flx-${Date.now()}`,
        recordId: `REC-FLX-${String(nextCount).padStart(3, "0")}`,
        flexibleMembershipId: `FLX-2026-${String(nextCount).padStart(3, "0")}`,
        primaryMemberName: data.primaryMemberName || "",
        primaryMobileNumber: data.primaryMobileNumber || "",
        email: data.email,
        address: data.address || "",
        joiningDate: join,
        expiryDate: expiry,
        totalHours: totalH,
        hoursUsed: usedH,
        hoursRemaining: remainingH,
        amountPaid: data.amountPaid || 450,
        status: computedStatus,
        remarks: data.remarks,
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Flexible Membership
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              📍 {currentBranch.name}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage flexible 30-hour memberships at <span className="font-semibold text-slate-700">{currentBranch.name} Branch</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold shadow-2xs">
            30 Hours / 45-Day Validity Package
          </span>
        </div>
      </div>

      {/* 4 Dashboard Cards (Calculated on branch-isolated records) */}
      <FlexibleDashboardCards memberships={filteredMemberships} />

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Primary Mobile Number..."
          />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-xs cursor-pointer appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Completed">Completed (30h)</option>
              <option value="Expired">Expired</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Expiry Filter */}
          <div className="relative">
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-xs cursor-pointer appearance-none"
            >
              <option value="All">All Expiries</option>
              <option value="7days">Expiring within 7 Days</option>
              <option value="15days">Expiring within 15 Days</option>
              <option value="expired">Already Expired</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          <Button
            onClick={() => {
              setMembershipToEdit(null);
              setIsModalOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flexible Membership</span>
          </Button>
        </div>
      </div>

      {/* Filter Reset if active */}
      {(searchQuery || statusFilter !== "All" || expiryFilter !== "All") && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Active filters:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                Phone: {searchQuery}
              </span>
            )}
            {statusFilter !== "All" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Status: {statusFilter}
              </span>
            )}
            {expiryFilter !== "All" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Expiry: {expiryFilter}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setExpiryFilter("All");
            }}
            className="text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Table & Mobile Cards */}
      <FlexibleMembershipTable
        memberships={filteredMemberships}
        onView={(record) => setViewingMembership(record)}
        onEdit={(record) => {
          setMembershipToEdit(record);
          setIsModalOpen(true);
        }}
        onAddNew={() => {
          setMembershipToEdit(null);
          setIsModalOpen(true);
        }}
      />

      {/* View Drawer */}
      <FlexibleMembershipDrawer
        membership={viewingMembership}
        isOpen={Boolean(viewingMembership)}
        onClose={() => setViewingMembership(null)}
        onEdit={(record) => {
          setMembershipToEdit(record);
          setIsModalOpen(true);
        }}
      />

      {/* Add/Edit Modal */}
      <FlexibleMembershipModal
        isOpen={isModalOpen}
        membershipToEdit={membershipToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setMembershipToEdit(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
