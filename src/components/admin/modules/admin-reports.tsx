"use client";

import React, { useState } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Users,
  CreditCard,
  AlertCircle,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BRANCHES } from "@/config/branches";
import { INITIAL_ADMIN_EMPLOYEES } from "@/data/admin-mock";

interface AdminReportsProps {
  selectedBranch: string;
}

export function AdminReports({ selectedBranch }: AdminReportsProps) {
  const [dateRange, setDateRange] = useState("Month to Date (March 2026)");
  const [branchFilter, setBranchFilter] = useState(selectedBranch);
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = (type: "Excel" | "PDF") => {
    setExportNotice(`Generated ${type} export report successfully.`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reports & Business Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Export Ready</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Generate executive summaries, coaching enrollment audits, and financial exports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => handleExport("Excel")}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-10 px-4 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </Button>
          <Button
            onClick={() => handleExport("PDF")}
            variant="outline"
            className="gap-2 text-slate-700 hover:text-slate-900 border-slate-200 rounded-xl h-10 px-4 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Date Range */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-500">Date Range</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="Today">Today (07 Mar 2026)</option>
              <option value="This Week">This Week (01 - 07 Mar 2026)</option>
              <option value="Month to Date (March 2026)">
                Month to Date (March 2026)
              </option>
              <option value="Last Month (February 2026)">
                Last Month (February 2026)
              </option>
              <option value="Fiscal Year 2025-2026">
                Fiscal Year 2025-2026
              </option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-500">Branch</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="all">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Filter */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-500">Employee</span>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Staff Members</option>
              {INITIAL_ADMIN_EMPLOYEES.map((e) => (
                <option key={e.id} value={e.employeeId}>
                  {e.name} ({e.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-500">Module Category</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="h-9.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Operations Modules</option>
              <option value="Sales">Sales & Invoices</option>
              <option value="Kids Coaching">Kids Coaching</option>
              <option value="Kids Coaching 1-1">Kids Coaching 1-1</option>
              <option value="Adults Coaching">Adults Coaching</option>
              <option value="Adults Coaching 1-1">Adults Coaching 1-1</option>
              <option value="Membership">Club Membership</option>
              <option value="Flexible Membership">Flexible Membership</option>
              <option value="Super Moms">Super Moms</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹18,45,200</p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Across selected period
          </span>
        </Card>

        {/* Admissions */}
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Admissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">142</p>
          <span className="text-[11px] text-slate-500">
            Total active students enrolled
          </span>
        </Card>

        {/* Memberships */}
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Memberships
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">86</p>
          <span className="text-[11px] text-purple-600 font-semibold">
            Regular & Flexible
          </span>
        </Card>

        {/* Pending Fees */}
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pending Fees
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600">₹34,500</p>
          <span className="text-[11px] text-slate-500">
            12 outstanding collections
          </span>
        </Card>
      </div>

      {/* Reports Breakdown Table */}
      <Card className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-200 bg-slate-50/60">
          <CardTitle className="text-sm font-bold text-slate-900">
            Operational Summary Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Program Module</th>
                  <th className="py-3 px-4">Target Workbook</th>
                  <th className="py-3 px-4">Enrolled / Active</th>
                  <th className="py-3 px-4">Collections</th>
                  <th className="py-3 px-4">Outstanding</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Kids Coaching (Group)</td>
                  <td className="py-3 px-4 font-mono text-slate-500">Kids Coaching.xlsx [Sheet 1]</td>
                  <td className="py-3 px-4">84 Students</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">₹6,84,000</td>
                  <td className="py-3 px-4 text-amber-600">₹14,200</td>
                  <td className="py-3 px-4"><span className="text-emerald-700 font-semibold">Healthy</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Kids Coaching 1-1</td>
                  <td className="py-3 px-4 font-mono text-slate-500">Kids Coaching.xlsx [Sheet 2]</td>
                  <td className="py-3 px-4">18 Students</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">₹2,45,000</td>
                  <td className="py-3 px-4 text-amber-600">₹6,500</td>
                  <td className="py-3 px-4"><span className="text-emerald-700 font-semibold">Healthy</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Adults Coaching (Group)</td>
                  <td className="py-3 px-4 font-mono text-slate-500">Adults Coaching.xlsx [Sheet 1]</td>
                  <td className="py-3 px-4">24 Members</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">₹2,88,000</td>
                  <td className="py-3 px-4 text-amber-600">₹4,800</td>
                  <td className="py-3 px-4"><span className="text-emerald-700 font-semibold">Healthy</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Adults Coaching 1-1</td>
                  <td className="py-3 px-4 font-mono text-slate-500">Adults Coaching.xlsx [Sheet 2]</td>
                  <td className="py-3 px-4">12 Members</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">₹1,95,000</td>
                  <td className="py-3 px-4 text-amber-600">₹3,000</td>
                  <td className="py-3 px-4"><span className="text-emerald-700 font-semibold">Healthy</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Club Memberships (Regular)</td>
                  <td className="py-3 px-4 font-mono text-slate-500">Membership.xlsx [Sheet 1]</td>
                  <td className="py-3 px-4">54 Accounts</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">₹3,12,000</td>
                  <td className="py-3 px-4 text-amber-600">₹4,000</td>
                  <td className="py-3 px-4"><span className="text-emerald-700 font-semibold">Healthy</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Flexible Memberships (30h)</td>
                  <td className="py-3 px-4 font-mono text-slate-500">Membership.xlsx [Sheet 2]</td>
                  <td className="py-3 px-4">32 Accounts</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">₹70,400</td>
                  <td className="py-3 px-4 text-slate-400">₹0</td>
                  <td className="py-3 px-4"><span className="text-emerald-700 font-semibold">Healthy</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800">Super Moms Coaching</td>
                  <td className="py-3 px-4 font-mono text-slate-500">Super Moms.xlsx [Sheet 1]</td>
                  <td className="py-3 px-4">16 Members</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">₹50,800</td>
                  <td className="py-3 px-4 text-amber-600">₹2,000</td>
                  <td className="py-3 px-4"><span className="text-emerald-700 font-semibold">Healthy</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
