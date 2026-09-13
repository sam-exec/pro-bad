"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Eye,
  X,
  Phone,
  Calendar,
  Building2,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { INITIAL_MEMBERSHIP_RECORDS } from "@/data/membership-mock";
import { INITIAL_FLEXIBLE_MEMBERSHIPS } from "@/data/flexible-membership-mock";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { BRANCHES } from "@/config/branches";
import { MONTHS } from "@/types/kids-coaching";
import { cn } from "@/lib/utils";

interface UnifiedMembershipRow {
  id: string;
  serialNumber?: number;
  name: string;
  phone: string;
  type: "Regular Membership" | "Flexible Membership";
  planName: string;
  branchId: string;
  branchName: string;
  status: string;
  joiningDate: string;
  expiryDate: string;
  amountPaid: number;
  month: string;
  additionalDetails?: string;
}

interface AdminMembershipsProps {
  selectedBranch: string;
}

export function AdminMemberships({ selectedBranch }: AdminMembershipsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [monthFilter, setMonthFilter] = useState<string>("All");
  const [viewingMember, setViewingMember] =
    useState<UnifiedMembershipRow | null>(null);

  // Combine regular and flexible membership datasets
  const allMemberships = useMemo<UnifiedMembershipRow[]>(() => {
    const list: UnifiedMembershipRow[] = [];

    // Regular
    INITIAL_MEMBERSHIP_RECORDS.forEach((m) => {
      list.push({
        id: m.id,
        serialNumber: m.serialNumber,
        name: m.primaryMemberName,
        phone: m.primaryMobileNumber,
        type: "Regular Membership",
        planName: m.membershipPlan,
        branchId: m.branchId,
        branchName: m.branchName,
        status: m.status,
        joiningDate: m.joiningDate,
        expiryDate: m.expiryDate,
        amountPaid: m.amountPaid,
        month: m.currentMonth,
        additionalDetails: `Address: ${m.address}, Additional Family Members: ${m.additionalMembers.length}`,
      });
    });

    // Flexible
    INITIAL_FLEXIBLE_MEMBERSHIPS.forEach((f) => {
      list.push({
        id: f.id,
        serialNumber: f.serialNumber,
        name: f.primaryMemberName,
        phone: f.primaryMobileNumber,
        type: "Flexible Membership",
        planName: "30 Hours (45-Day Package)",
        branchId: f.branchId,
        branchName: f.branchName,
        status: f.status,
        joiningDate: f.joiningDate,
        expiryDate: f.expiryDate,
        amountPaid: f.amountPaid,
        month: "March",
        additionalDetails: `Hours Used: ${f.hoursUsed}/${f.totalHours} hrs (Remaining: ${f.hoursRemaining} hrs)`,
      });
    });

    return list;
  }, []);

  // Filter logic
  const filteredMemberships = useMemo(() => {
    return allMemberships.filter((item) => {
      if (selectedBranch !== "all" && item.branchId !== selectedBranch) {
        return false;
      }
      if (branchFilter !== "All" && item.branchId !== branchFilter) {
        return false;
      }
      if (typeFilter !== "All" && item.type !== typeFilter) {
        return false;
      }
      if (statusFilter !== "All" && item.status !== statusFilter) {
        return false;
      }
      if (monthFilter !== "All" && item.month !== monthFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchPhone = item.phone.includes(q.replace(/\D/g, ""));
        const matchPlan = item.planName.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchPlan) return false;
      }
      return true;
    });
  }, [
    allMemberships,
    selectedBranch,
    branchFilter,
    typeFilter,
    statusFilter,
    monthFilter,
    searchQuery,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Memberships Registry
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <CreditCard className="w-3.5 h-3.5" />
              <span>{filteredMemberships.length} Accounts</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Consolidated overview of Regular Club Memberships and Flexible 30-Hour cardholders.
          </p>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by member name, phone, or plan..."
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

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Membership Types</option>
              <option value="Regular Membership">Regular Club Membership</option>
              <option value="Flexible Membership">Flexible 30-Hour Pack</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Completed">Completed</option>
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
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Membership Type</th>
                <th className="py-3.5 px-4">Plan / Package</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMemberships.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No membership records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMemberships.map((m) => (
                  <tr
                    key={`${m.type}-${m.id}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {m.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {m.phone}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                          m.type === "Flexible Membership"
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        )}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 max-w-[200px] truncate">
                      {m.planName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border",
                          m.branchId === "branch-mnk"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {m.branchName}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                          m.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : m.status === "Expiring Soon"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : m.status === "Expired"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            m.status === "Active"
                              ? "bg-emerald-500"
                              : m.status === "Expiring Soon"
                              ? "bg-amber-500"
                              : m.status === "Expired"
                              ? "bg-red-500"
                              : "bg-slate-400"
                          )}
                        />
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {m.expiryDate}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingMember(m)}
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

      {/* Details Drawer */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {viewingMember.name}
                </h3>
                <span className="text-xs font-semibold text-purple-700">
                  {viewingMember.type} {viewingMember.serialNumber ? `• Serial No: #${viewingMember.serialNumber}` : ""}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Plan Details
                </span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {viewingMember.planName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Branch
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {viewingMember.branchName}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Amount Paid
                  </span>
                  <p className="font-bold text-emerald-600 mt-0.5">
                    ₹{viewingMember.amountPaid}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Joining Date
                  </span>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">
                    {viewingMember.joiningDate}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Expiry Date
                  </span>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">
                    {viewingMember.expiryDate}
                  </p>
                </div>
              </div>

              {viewingMember.additionalDetails && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Additional Information
                  </h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {viewingMember.additionalDetails}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingMember(null)}
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
