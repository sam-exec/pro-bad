"use client";

import React from "react";
import { CircleDollarSign, Clock, Layers, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BRANCHES } from "@/config/branches";

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
              Sales & Invoicing
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CircleDollarSign className="w-3.5 h-3.5" />
              <span>{branchName}</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise invoicing, court booking billing, and merchandise transactions.
          </p>
        </div>
      </div>

      {/* Integration Ready Card */}
      <Card className="border-dashed border-2 border-slate-200 bg-white/70 p-8 sm:p-14 text-center rounded-2xl">
        <CardHeader className="p-0 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
            <CircleDollarSign className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Sales module will appear here after integration.
          </CardTitle>
          <CardDescription className="text-slate-500 max-w-lg mt-2 text-sm sm:text-base">
            The service layer (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">salesService</code> and <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">Sales.xlsx</code>) is already fully prepared. Once the shared Sales module UI is completed, it will drop directly into this page without modifying the Admin layout.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Excel Service Architecture Ready</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
