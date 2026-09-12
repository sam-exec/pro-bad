import React from "react";
import { Construction } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { NavigationItem } from "./types";

interface ModulePlaceholderProps {
  item: NavigationItem;
}

export function ModulePlaceholder({ item }: ModulePlaceholderProps) {
  const Icon = item.icon;

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.label}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {item.label} module coming soon.
            </p>
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
            This module is part of the next development phase. Records, filters, and operational workflows for {item.label.toLowerCase()} will be available here.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Phase 2 Feature
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
