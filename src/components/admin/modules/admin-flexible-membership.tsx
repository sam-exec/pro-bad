"use client";

import React, { useState, useMemo } from "react";
import { Plus, Users, Timer, Clock, Eye, Edit2 } from "lucide-react";
import { FlexibleMembershipRecord } from "@/types/flexible-membership";
import { membershipService } from "@/services/excel";
import { SearchBar } from "@/components/kids-coaching/search-bar";
import { FlexibleStatusBadge } from "@/components/flexible-membership/flexible-status-badge";
import { HoursProgressBar } from "@/components/flexible-membership/hours-progress-bar";
import { FlexibleMembershipDrawer } from "@/components/flexible-membership/flexible-membership-drawer";
import { FlexibleMembershipModal } from "@/components/flexible-membership/flexible-membership-modal";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";

interface AdminFlexibleMembershipProps {
  selectedBranch: string; // "all" | "branch-nlg" | "branch-mnk"
}

const EXPORT_COLUMNS: ExportColumn<FlexibleMembershipRecord>[] = [
  { header: "Serial No", key: "serialNumber", formatter: (r) => `#${r.serialNumber ?? ""}` },
  { header: "Primary Member", key: "primaryMemberName" },
  { header: "Mobile Number", key: "primaryMobileNumber" },
  { header: "Email", key: "email" },
  { header: "Branch", key: "branchName", formatter: (r) => r.branchName || "Nallagandla" },
  { header: "Total Hours", key: "totalHours", formatter: (r) => `${r.totalHours} hrs` },
  { header: "Hours Used", key: "hoursUsed", formatter: (r) => `${r.hoursUsed} hrs` },
  { header: "Hours Remaining", key: "hoursRemaining", formatter: (r) => `${r.hoursRemaining} hrs` },
  { header: "Amount Paid", key: "amountPaid", formatter: (r) => `₹${r.amountPaid}` },
  { header: "Payment Method", key: "paymentMethod" },
  { header: "Status", key: "status" },
  { header: "Joining Date", key: "joiningDate" },
  { header: "Expiry Date", key: "expiryDate" },
];

export function AdminFlexibleMembership({ selectedBranch }: AdminFlexibleMembershipProps) {
  const [records, setRecords] = useState<FlexibleMembershipRecord[]>(() =>
    membershipService.getSnapshotFlexible()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer & Modal
  const [viewingRecord, setViewingRecord] = useState<FlexibleMembershipRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<FlexibleMembershipRecord | null>(null);

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
      if (statusFilter !== "All" && r.status !== statusFilter) {
        return false;
      }
      if (paymentMethodFilter !== "All" && r.paymentMethod !== paymentMethodFilter) {
        return false;
      }
      return true;
    });
  }, [records, selectedBranch, searchQuery, statusFilter, paymentMethodFilter]);

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
    const hoursUsed = filteredRecords.reduce((sum, r) => sum + r.hoursUsed, 0);
    const hoursRemaining = filteredRecords.reduce((sum, r) => sum + r.hoursRemaining, 0);
    return { total, active, hoursUsed, hoursRemaining };
  }, [filteredRecords]);

  const handleSave = async (recordData: Partial<FlexibleMembershipRecord>, idToEdit?: string) => {
    const targetBranchId = selectedBranch !== "all" ? selectedBranch : "branch-nlg";
    const targetBranchName = targetBranchId === "branch-mnk" ? "Manikonda" : "Nallagandla";

    if (idToEdit) {
      await membershipService.updateFlexible(idToEdit, recordData, "ADM001");
    } else {
      await membershipService.createFlexible(recordData as any, {
        branchId: targetBranchId,
        branchName: targetBranchName,
        employeeId: "ADM001",
        employeeName: "Super Admin",
      });
    }
    setRecords(membershipService.getSnapshotFlexible());
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
              Flexible 30-Hour Membership
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Timer className="w-3.5 h-3.5" />
              <span>{filteredRecords.length} Packages</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pay-as-you-play 30-hour court booking balance cards with 45-day validity.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown
            moduleName="Flexible_Membership"
            moduleTitle="Flexible 30-Hour Membership Registry"
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
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flexible Pack</span>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Passes</p>
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
              <p className="text-xs text-slate-500 font-medium">Active Passes</p>
              <h3 className="text-xl font-bold text-emerald-600">{metrics.active}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Hours Played</p>
              <h3 className="text-xl font-bold text-blue-600">{metrics.hoursUsed} hrs</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Balance Hours</p>
              <h3 className="text-xl font-bold text-amber-600">{metrics.hoursRemaining} hrs</h3>
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
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <PaymentMethodFilter
            value={paymentMethodFilter}
            onChange={setPaymentMethodFilter}
          />
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Timer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No flexible memberships found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or enroll a new flexible pass member.</p>
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
                  <th className="px-3.5 py-3 whitespace-nowrap min-w-[160px]">Court Hours Balance</th>
                  <th className="px-3.5 py-3 text-right whitespace-nowrap">Amount Paid</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Payment Method</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Joining Date</th>
                  <th className="px-3.5 py-3 whitespace-nowrap">Expiry Date</th>
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
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <HoursProgressBar hoursUsed={r.hoursUsed} totalHours={r.totalHours} />
                      </td>
                      <td className="px-3.5 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        ₹{r.amountPaid}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <PaymentMethodBadge method={r.paymentMethod} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <FlexibleStatusBadge status={r.status} />
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                        {r.joiningDate}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-500">
                        {r.expiryDate}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingRecord(r)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Details"
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
                            title="Edit Record"
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
      <FlexibleMembershipDrawer
        membership={viewingRecord}
        isOpen={Boolean(viewingRecord)}
        onClose={() => setViewingRecord(null)}
        onEdit={(r) => {
          setViewingRecord(null);
          setRecordToEdit(r);
          setIsFormOpen(true);
        }}
      />

      {/* Modal */}
      <FlexibleMembershipModal
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
