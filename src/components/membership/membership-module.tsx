"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus, Users, CreditCard, DollarSign, Eye, Edit2, LayoutGrid } from "lucide-react";
import { MembershipRecord } from "@/types/membership";
import { PaymentMethod } from "@/types/payment";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { membershipService } from "@/services/excel";
import { UniversalSearch } from "@/components/ui/universal-search";
import { universalMatch } from "@/lib/search";
import { MonthFilter } from "@/components/kids-coaching/month-filter";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentBadge } from "@/components/kids-coaching/payment-badge";
import { MembershipDetailsDrawer } from "./membership-details-drawer";
import { MembershipFormModal } from "./membership-form-modal";
import { Button } from "@/components/ui/button";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";
import { useAuth } from "@/context/auth-context";

const EXPORT_COLUMNS: ExportColumn<MembershipRecord>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (_r, idx) => `${idx + 1}` },
  { header: "Primary Member", key: "primaryMemberName" },
  { header: "Mobile", key: "primaryMobileNumber" },
  { header: "Email", key: "email" },
  { header: "Plan", key: "membershipPlan" },
  { header: "Court", key: "courtNumber", formatter: (r) => r.courtNumber || "Court 1" },
  { header: "Timing", key: "timing", formatter: (r) => r.timing || "06:00 AM - 07:00 AM" },
  {
    header: "Additional Members",
    key: "additionalMembers",
    formatter: (r) => `${r.additionalMembers?.length || 0} members`,
  },
  { header: "Monthly Fee", key: "monthlyFee", formatter: (r) => `₹${r.monthlyFee}` },
  { header: "Amount Paid", key: "amountPaid", formatter: (r) => `₹${r.amountPaid}` },
  { header: "Due Amount", key: "dueAmount", formatter: (r) => `₹${r.dueAmount}` },
  { header: "Payment Method", key: "paymentMethod" },
  { header: "Payment Status", key: "paymentStatus" },
  { header: "Status", key: "status" },
  { header: "Joining Date", key: "joiningDate" },
  { header: "Expiry Date", key: "expiryDate" },
];

export function MembershipModule() {
  const { employeeId, employeeName } = useAuth();
  const [memberships, setMemberships] = useState<MembershipRecord[]>(() =>
    membershipService.getSnapshot()
  );

  useEffect(() => {
    const handleUpdate = () => setMemberships(membershipService.getSnapshot());
    window.addEventListener("excel-data-updated", handleUpdate);
    return () => window.removeEventListener("excel-data-updated", handleUpdate);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal & Drawer State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [membershipToEdit, setMembershipToEdit] = useState<MembershipRecord | null>(null);
  const [viewingMembership, setViewingMembership] = useState<MembershipRecord | null>(null);

  // Filter logic: Search by Primary Mobile + Month/Year + Payment Method
  const filteredMemberships = useMemo(() => {
    const seenIds = new Set<string>();
    return memberships.filter((m) => {
      if (seenIds.has(m.id)) {
        return false;
      }
      seenIds.add(m.id);

      // Universal Search
      if (searchQuery.trim() && !universalMatch(m, searchQuery)) {
        return false;
      }

      // Month filter
      if (selectedMonth !== "All" && m.currentMonth !== selectedMonth) {
        return false;
      }

      // Year filter
      if (m.year !== selectedYear) {
        return false;
      }

      // Payment Method filter
      if (paymentMethodFilter !== "all" && m.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      return true;
    });
  }, [memberships, searchQuery, selectedMonth, selectedYear, paymentMethodFilter]);

  const selectedRecords = useMemo(() => {
    return memberships.filter((r) => selectedIds.includes(r.id));
  }, [memberships, selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredMemberships.length > 0 &&
    filteredMemberships.every((r) => selectedIds.includes(r.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const cur = new Set(filteredMemberships.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !cur.has(id)));
    } else {
      const cur = filteredMemberships.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...cur])));
    }
  };

  // Aggregate stats matching admin metrics
  const metrics = useMemo(() => {
    const total = filteredMemberships.length;
    const active = filteredMemberships.filter((r) => r.status === "Active").length;
    const totalDue = filteredMemberships.reduce((sum, r) => sum + r.dueAmount, 0);
    const familyMembers = filteredMemberships.reduce(
      (sum, r) => sum + 1 + (r.additionalMembers?.length || 0),
      0
    );
    return { total, active, totalDue, familyMembers };
  }, [filteredMemberships]);

  // Save / Update Handler
  const handleSaveMembership = async (
    data: Partial<MembershipRecord>,
    idToEdit?: string
  ) => {
    if (idToEdit) {
      const updated = await membershipService.update(
        idToEdit,
        data,
        employeeId
      );

      setMemberships(membershipService.getSnapshot());

      if (viewingMembership?.id === idToEdit) {
        setViewingMembership(updated);
      }
    } else {
      await membershipService.create(
        {
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
          paymentMethod: data.paymentMethod || "UPI",
          status: data.status || "Active",
          remarks: data.remarks,
          timing: data.timing,
          courtNumber: data.courtNumber,
          currentMonth: data.currentMonth || "March",
          year: 2026,
          additionalMembers: data.additionalMembers || [],
        },
        {
          employeeId,
          employeeName,
        }
      );

      setMemberships(membershipService.getSnapshot());
    }
    setIsFormOpen(false);
    setMembershipToEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Club Membership
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <CreditCard className="w-3.5 h-3.5" />
              <span>{filteredMemberships.length} Plans</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Regular club members, family memberships, and court subscription packages.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Membership"
            moduleTitle="Club Membership Registry"
            subtitle="Facility Registry"
            columns={EXPORT_COLUMNS}
            currentViewData={filteredMemberships}
            selectedData={selectedRecords}
            entireModuleData={memberships}
          />
          <Button
            onClick={() => {
              setMembershipToEdit(null);
              setIsFormOpen(true);
            }}
            className="h-10 px-4 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Membership</span>
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Plans */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Plans
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Registered memberships
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Total Beneficiaries */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Beneficiaries
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              {metrics.familyMembers}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Primary &amp; family members
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Status */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Status
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 mt-1 block">
              {metrics.active}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              In-validity memberships
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Dues */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Pending Dues
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 mt-1 block">
              ₹{metrics.totalDue}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Outstanding subscription fees
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters */}
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

      {/* Table */}
      {filteredMemberships.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No membership records found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or enroll a new club member.</p>
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
                  <th className="px-3.5 py-3 whitespace-nowrap">Primary Member</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Mobile</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Plan Details</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Court &amp; Timing</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Additional Members</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Fee</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Due</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredMemberships.map((r, index) => {
                  const isChecked = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 transition-colors text-xs text-slate-700 ${
                        isChecked ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(r.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3.5 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {index + 1}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {r.primaryMemberName}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {r.primaryMobileNumber}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap max-w-[170px] truncate" title={r.membershipPlan}>
                        {r.membershipPlan}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 w-fit">
                            <LayoutGrid className="w-3 h-3 text-blue-600" />
                            {r.courtNumber || "Court 1"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {r.timing || "06:00 AM - 07:00 AM"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          +{r.additionalMembers?.length || 0} Members
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                        ₹{r.monthlyFee}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        ₹{r.amountPaid}
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                        ₹{r.dueAmount}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentMethodBadge method={r.paymentMethod} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentBadge status={r.paymentStatus} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                        {r.joiningDate}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingMembership(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Membership"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMembershipToEdit(r);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Membership"
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

      {/* View Drawer */}
      <MembershipDetailsDrawer
        membership={viewingMembership}
        isOpen={Boolean(viewingMembership)}
        onClose={() => setViewingMembership(null)}
        onEdit={(record) => {
          setViewingMembership(null);
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
export default MembershipModule;
