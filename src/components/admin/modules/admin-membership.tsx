"use client";

import React, { useState, useMemo } from "react";
import { Plus, Users, CreditCard, DollarSign, Eye, Edit2 } from "lucide-react";
import { MembershipRecord, MEMBERSHIP_PLANS } from "@/types/membership";
import { membershipService } from "@/services/excel";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { MonthFilter } from "@/components/kids-coaching/month-filter";
import { StatusBadge } from "@/components/kids-coaching/status-badge";
import { PaymentBadge } from "@/components/kids-coaching/payment-badge";
import { MembershipDetailsDrawer } from "@/components/membership/membership-details-drawer";
import { MembershipFormModal } from "@/components/membership/membership-form-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";

interface AdminMembershipProps {
  selectedBranch: string; // "all" | "branch-nlg" | "branch-mnk"
}

const EXPORT_COLUMNS: ExportColumn<MembershipRecord>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (r) => `#${r.serialNumber ?? ""}` },
  { header: "Primary Member", key: "primaryMemberName" },
  { header: "Mobile", key: "primaryMobileNumber" },
  { header: "Email", key: "email" },
  { header: "Branch", key: "branchName", formatter: (r) => r.branchName || "Nallagandla" },
  { header: "Plan", key: "membershipPlan" },
  {
    header: "Additional Members",
    key: "additionalMembers",
    formatter: (r) => `${r.additionalMembers?.length || 0} members`,
  },
  { header: "Monthly Fee", key: "monthlyFee", formatter: (r) => `₹${r.monthlyFee}` },
  { header: "Amount Paid", key: "amountPaid", formatter: (r) => `₹${r.amountPaid}` },
  { header: "Due Amount", key: "dueAmount", formatter: (r) => `₹${r.dueAmount}` },
  { header: "Payment Status", key: "paymentStatus" },
  { header: "Status", key: "status" },
  { header: "Joining Date", key: "joiningDate" },
  { header: "Expiry Date", key: "expiryDate" },
];

export function AdminMembership({ selectedBranch }: AdminMembershipProps) {
  const [records, setRecords] = useState<MembershipRecord[]>(() =>
    membershipService.getSnapshot()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer & Modal
  const [viewingRecord, setViewingRecord] = useState<MembershipRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<MembershipRecord | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedBranch !== "all" && r.branchId && r.branchId !== selectedBranch) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().replace(/\D/g, "");
        const cleanPhone = r.primaryMobileNumber.replace(/\D/g, "");
        if (!cleanPhone.includes(q)) return false;
      }
      if (selectedMonth !== "All" && r.currentMonth !== selectedMonth) {
        return false;
      }
      if (r.year !== selectedYear) {
        return false;
      }
      return true;
    });
  }, [records, selectedBranch, searchQuery, selectedMonth, selectedYear]);

  const selectedRecords = useMemo(() => {
    return records.filter((r) => selectedIds.includes(r.id));
  }, [records, selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r) => selectedIds.includes(r.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const cur = new Set(filteredRecords.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !cur.has(id)));
    } else {
      const cur = filteredRecords.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...cur])));
    }
  };

  const metrics = useMemo(() => {
    const total = filteredRecords.length;
    const active = filteredRecords.filter((r) => r.status === "Active").length;
    const totalDue = filteredRecords.reduce((sum, r) => sum + r.dueAmount, 0);
    const familyMembers = filteredRecords.reduce(
      (sum, r) => sum + 1 + (r.additionalMembers?.length || 0),
      0
    );
    return { total, active, totalDue, familyMembers };
  }, [filteredRecords]);

  const handleSave = (recordData: Partial<MembershipRecord>, idToEdit?: string) => {
    const targetBranchId = selectedBranch !== "all" ? selectedBranch : "branch-nlg";
    const targetBranchName = targetBranchId === "branch-mnk" ? "Manikonda" : "Nallagandla";

    if (idToEdit) {
      membershipService.update(idToEdit, recordData, "ADM001");
    } else {
      membershipService.create(recordData as any, {
        branchId: targetBranchId,
        branchName: targetBranchName,
        employeeId: "ADM001",
        employeeName: "Super Admin",
      });
    }
    setRecords(membershipService.getSnapshot());
    setIsFormOpen(false);
    setRecordToEdit(null);
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
              <span>{filteredRecords.length} Plans</span>
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
            subtitle={`Branch: ${selectedBranch === "all" ? "All Branches" : selectedBranch}`}
            columns={EXPORT_COLUMNS}
            currentViewData={filteredRecords}
            selectedData={selectedRecords}
            entireModuleData={records}
          />
          <Button
            onClick={() => {
              setRecordToEdit(null);
              setIsFormOpen(true);
            }}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Membership</span>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Plans</p>
              <h3 className="text-xl font-bold text-slate-900">{metrics.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Beneficiaries</p>
              <h3 className="text-xl font-bold text-emerald-600">{metrics.familyMembers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Status</p>
              <h3 className="text-xl font-bold text-purple-600">{metrics.active}</h3>
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
          placeholder="Search by primary mobile number..."
        />
        <MonthFilter
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
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
                  <th className="px-3.5 py-3 whitespace-nowrap">Branch</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Plan Details</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Additional Members</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Fee</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Paid</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Due</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap sticky right-0 bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredRecords.map((r) => {
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
                        #{r.serialNumber}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {r.primaryMemberName}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {r.primaryMobileNumber}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {r.branchName || "Nallagandla"}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap max-w-[170px] truncate" title={r.membershipPlan}>
                        {r.membershipPlan}
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
                        <PaymentBadge status={r.paymentStatus} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingRecord(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Membership"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRecordToEdit(r);
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

      {/* Drawer */}
      <MembershipDetailsDrawer
        membership={viewingRecord}
        isOpen={Boolean(viewingRecord)}
        onClose={() => setViewingRecord(null)}
        onEdit={(r) => {
          setViewingRecord(null);
          setRecordToEdit(r);
          setIsFormOpen(true);
        }}
      />

      {/* Form Modal */}
      <MembershipFormModal
        isOpen={isFormOpen}
        membershipToEdit={recordToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setRecordToEdit(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
