"use client";

import React from "react";
import { CircleDollarSign } from "lucide-react";
import { BRANCHES } from "@/config/branches";
import { AdminSalesModule } from "@/components/sales/admin-sales-module";

interface AdminSalesProps {
  selectedBranch: string;
}

export function AdminSales({ selectedBranch }: AdminSalesProps) {
  const branchName =
    selectedBranch === "all"
      ? "All Branches (Consolidated)"
      : BRANCHES.find((b) => b.id === selectedBranch)?.name || "All Branches";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sales Management &amp; Reporting
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CircleDollarSign className="w-3.5 h-3.5" />
              <span>{branchName}</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Consolidated multi-branch transactions, employee performance tracking, and sales reporting.
          </p>
        </div>
      </div>

      {/* Main Admin Sales Module */}
      <AdminSalesModule selectedBranch={selectedBranch} />
    </div>
  );
}

export default AdminSales;
