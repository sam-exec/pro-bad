"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  Clock,
  Building2,
  User,
  Layers,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { INITIAL_AUDIT_LOGS, INITIAL_ADMIN_EMPLOYEES } from "@/data/admin-mock";
import { UniversalSearch } from "@/components/ui/universal-search";
import { universalMatch } from "@/lib/search";
import { cn } from "@/lib/utils";

export function AdminAuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [moduleFilter, setModuleFilter] = useState("All");

  const filteredLogs = useMemo(() => {
    return INITIAL_AUDIT_LOGS.filter((log) => {
      if (employeeFilter !== "All" && log.employeeId !== employeeFilter) {
        return false;
      }
      if (moduleFilter !== "All" && log.module !== moduleFilter) {
        return false;
      }
      if (searchQuery.trim() && !universalMatch(log, searchQuery)) {
        return false;
      }
      return true;
    });
  }, [employeeFilter, moduleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Audit Logs & Activity Trail
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <History className="w-3.5 h-3.5" />
              <span>{filteredLogs.length} Events Logged</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tamper-evident chronological timeline of all staff operational actions and data updates.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <UniversalSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, ID, phone, or email..."
          />

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Employee */}
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Employees</option>
              {INITIAL_ADMIN_EMPLOYEES.map((e) => (
                <option key={e.id} value={e.employeeId}>
                  {e.name}
                </option>
              ))}
            </select>

            {/* Module */}
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="All">All Modules</option>
              <option value="Kids Coaching">Kids Coaching</option>
              <option value="Kids Coaching 1-1">Kids Coaching 1-1</option>
              <option value="Adults Coaching">Adults Coaching</option>
              <option value="Membership">Membership</option>
              <option value="Flexible Membership">Flexible Membership</option>
              <option value="Super Moms">Super Moms</option>
              <option value="PBA Store">PBA Store</option>
              <option value="Inventory">Inventory</option>
              <option value="Purchase History">Purchase History</option>
              <option value="Settings">Settings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">
              No audit records found matching the active filters.
            </p>
          ) : (
            filteredLogs.map((log) => {
              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white border border-indigo-300" />

                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 group-hover:border-slate-300 group-hover:bg-slate-50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {log.action}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {log.module}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {log.timestamp}
                      </span>
                    </div>

                    {log.details && (
                      <p className="text-xs text-slate-600 mb-3 bg-white p-2.5 rounded-lg border border-slate-200/60">
                        {log.details}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.employeeName}</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          ({log.employeeId})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
