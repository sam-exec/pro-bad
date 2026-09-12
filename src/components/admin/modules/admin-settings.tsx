"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  Users,
  Shield,
  FileSpreadsheet,
  Database,
  Palette,
  Check,
  Save,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "general"
  | "branches"
  | "employees"
  | "permissions"
  | "excel"
  | "database"
  | "appearance";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "branches", label: "Branches", icon: Building2 },
    { id: "employees", label: "Employees", icon: Users },
    { id: "permissions", label: "Permissions", icon: Shield },
    { id: "excel", label: "Excel Export", icon: FileSpreadsheet },
    { id: "database", label: "Database", icon: Database },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Settings
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Settings className="w-3.5 h-3.5" />
              <span>Configuration</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Global system parameters, security policies, and future database connectors.
          </p>
        </div>

        {savedNotice && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings saved locally.</span>
          </span>
        )}
      </div>

      {/* Settings Layout with Tab List */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Tabs */}
        <div className="w-full md:w-56 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <Card className="flex-1 bg-white border border-slate-200 shadow-xs rounded-2xl p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    General Club Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Primary company identity and business contact information.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="clubName">Organization Name</Label>
                    <Input
                      id="clubName"
                      defaultValue="ProBadminton Academy & Sports Club"
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="supportEmail">Primary Support Email</Label>
                    <Input
                      id="supportEmail"
                      defaultValue="admin@probadminton.com"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fiscalYear">Fiscal Year Setting</Label>
                    <Input
                      id="fiscalYear"
                      defaultValue="April 1 - March 31"
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="currency">Currency Code</Label>
                    <Input
                      id="currency"
                      defaultValue="INR (₹)"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "branches" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Branch Operating Parameters
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Multi-branch isolation and court management policies.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-bold text-slate-800">
                    Active Multi-Branch Architecture
                  </p>
                  <p className="text-slate-600">
                    Data isolation is enforced at the service layer using Branch IDs (<code className="font-mono bg-white px-1.5 py-0.5 rounded border">branch-nlg</code>, <code className="font-mono bg-white px-1.5 py-0.5 rounded border">branch-mnk</code>).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultBranch">Default Fallback Branch</Label>
                  <select
                    id="defaultBranch"
                    defaultValue="branch-nlg"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <option value="branch-nlg">Nallagandla (NLG)</option>
                    <option value="branch-mnk">Manikonda (MNK)</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "employees" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Employee Access Policies
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authentication rules and password expiration thresholds.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      Enforce prefix-based branch assignment on employee login (e.g. NLGxxx, MNKxxx)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      Log every staff transaction and audit modification timestamp
                    </span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "permissions" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Roles & Permissions
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define access scopes between Staff and Tier 1 Administrators.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
                  <p className="font-bold">Role Hierarchy Defined:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li><strong className="text-indigo-800">Administrator:</strong> Full cross-branch visibility, financial analytics, audit trail, employee management.</li>
                    <li><strong className="text-indigo-800">Operations Lead:</strong> Full read/write within assigned branch.</li>
                    <li><strong className="text-indigo-800">Desk Manager:</strong> Admissions, memberships, and billing within assigned branch.</li>
                    <li><strong className="text-indigo-800">Coach:</strong> Student attendance, session logging, and court slots.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "excel" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Excel Synchronization Configuration
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target workbooks and worksheet synchronization settings.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span>1. Sales.xlsx</span>
                    <span className="font-mono text-emerald-600 font-bold">Sales Worksheet</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span>2. Kids Coaching.xlsx</span>
                    <span className="font-mono text-indigo-600 font-bold">2 Worksheets (Group & 1-1)</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span>3. Adults Coaching.xlsx</span>
                    <span className="font-mono text-indigo-600 font-bold">2 Worksheets (Group & 1-1)</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span>4. Membership.xlsx</span>
                    <span className="font-mono text-purple-600 font-bold">2 Worksheets (Regular & Flexible)</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span>5. Super Moms.xlsx</span>
                    <span className="font-mono text-pink-600 font-bold">Super Moms Worksheet</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Backend Database Integration (Ready)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supabase / PostgreSQL connection placeholders.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="dbUrl">Database Connection URI (Placeholder)</Label>
                    <Input
                      id="dbUrl"
                      placeholder="postgresql://postgres:[password]@db.supabase.co:5432/postgres"
                      className="font-mono text-xs h-10"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    The service layer interfaces already map 1-to-1 to relational schema tables.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Appearance & Theme Settings
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Design language, brand accents, and interface preferences.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-indigo-600 bg-indigo-50/40 cursor-pointer">
                    <span className="font-bold text-slate-900">Slate / Indigo (Active)</span>
                    <p className="text-slate-500 mt-0.5">Premium enterprise admin palette.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                    <span className="font-bold text-slate-700">Dark Mode (Coming Soon)</span>
                    <p className="text-slate-400 mt-0.5">High-contrast night styling.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <Button
                type="submit"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 px-5 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
