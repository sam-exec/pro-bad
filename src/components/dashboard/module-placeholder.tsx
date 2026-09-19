import React from "react";
import { Construction } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { NavigationItem } from "./types";
import { useAuth } from "@/context/auth-context";

interface ModulePlaceholderProps {
  item: NavigationItem;
}

export function ModulePlaceholder({ item }: ModulePlaceholderProps) {
  const { employeeId, employeeName } = useAuth();
  const Icon = item.icon;

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {item.label}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {item.label} module for <span className="font-semibold text-slate-700">PRO Badminton Academy</span>.
              </p>
            </div>
          </div>

          {/* Operator Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Emp: {employeeId}
            </span>
          </div>
        </div>
      </div>

      {/* Placeholder Card */}
      <Card className="border-dashed border-2 border-slate-200 bg-white/60 p-8 sm:p-12 text-center rounded-2xl">
        <CardHeader className="p-0 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mb-4">
            <Construction className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-800">
            {item.label} Module In Development
          </CardTitle>
          <CardDescription className="text-slate-500 max-w-md mt-2 text-sm">
            This module is part of the next development phase. All records created here will automatically bind to operator{" "}
            <span className="font-semibold text-slate-700">{employeeName} ({employeeId})</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Single Facility System
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
