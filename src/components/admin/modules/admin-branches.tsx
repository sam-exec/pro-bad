"use client";

import React from "react";
import {
  Building2,
  Users,
  GraduationCap,
  DollarSign,
  Phone,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BRANCH_SUMMARIES } from "@/data/admin-mock";
import { cn } from "@/lib/utils";

interface AdminBranchesProps {
  selectedBranch: string;
}

export function AdminBranches({ selectedBranch }: AdminBranchesProps) {
  const branches =
    selectedBranch === "all"
      ? BRANCH_SUMMARIES
      : BRANCH_SUMMARIES.filter((b) => b.branchId === selectedBranch);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Branch Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>{branches.length} Active Locations</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Centralized multi-branch control, facility capacity, and financial breakdown.
          </p>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch) => {
          const isManikonda = branch.code === "MNK";

          return (
            <Card
              key={branch.branchId}
              className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Branch Header Banner */}
              <div
                className={cn(
                  "p-6 text-white flex items-center justify-between",
                  isManikonda
                    ? "bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800"
                    : "bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-extrabold text-lg">
                    {branch.code}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      {branch.name} Branch
                    </h3>
                    <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{branch.address}</span>
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-900 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {branch.status}
                </span>
              </div>

              {/* 4 Core Metrics Grid */}
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Employees */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        Staff
                      </span>
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900">
                      {branch.employeesCount}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Coaches & Desk
                    </span>
                  </div>

                  {/* Students */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        Students
                      </span>
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900">
                      {branch.studentsCount}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Enrolled active
                    </span>
                  </div>

                  {/* Memberships */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        Members
                      </span>
                      <Layers className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900">
                      {branch.activeMembershipsCount}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      Active accounts
                    </span>
                  </div>

                  {/* Revenue */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        Revenue
                      </span>
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900">
                      ₹{(branch.revenue / 100000).toFixed(2)}L
                    </p>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Monthly target met
                    </span>
                  </div>
                </div>

                {/* Facilities & Operations Info */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Courts Available:</span>
                    <span className="font-bold text-slate-800">
                      {branch.courtsCount} BWF Approved Synthetic Courts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact Line:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {branch.phone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Internal Identifier:</span>
                    <span className="font-mono text-indigo-600 font-bold">
                      {branch.branchId}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expansion Roadmap Note */}
      <Card className="p-6 bg-indigo-50/40 border border-indigo-100 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Multi-Branch Scaling Ready
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              The architecture supports adding new branches (e.g. GCH, HYD, KPHB) without changing database schemas or routing logic.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
