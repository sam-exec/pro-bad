"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileSpreadsheet, FileText, Table } from "lucide-react";
import { ExportColumn, exportToExcel, exportToCsv, exportToPdf } from "@/utils/export-engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportDropdownProps<T> {
  moduleName: string; // e.g. "Kids_Coaching"
  moduleTitle: string; // e.g. "Kids Coaching Registry"
  subtitle?: string;
  columns: ExportColumn<T>[];
  currentViewData: T[];
  selectedData: T[];
  entireModuleData: T[];
  disabled?: boolean;
}

export function ExportDropdown<T>({
  moduleName,
  moduleTitle,
  subtitle = "Enterprise Administrative Export",
  columns,
  currentViewData,
  selectedData,
  entireModuleData,
  disabled = false,
}: ExportDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getDateSlug = () => new Date().toISOString().split("T")[0];

  const handleExport = (
    scope: "Current_View" | "Selected_Records" | "Entire_Module",
    format: "excel" | "csv" | "pdf"
  ) => {
    let dataset: T[] = [];
    let scopeLabel = "";

    if (scope === "Current_View") {
      dataset = currentViewData;
      scopeLabel = "Current View";
    } else if (scope === "Selected_Records") {
      dataset = selectedData;
      scopeLabel = "Selected Records";
    } else {
      dataset = entireModuleData;
      scopeLabel = "Entire Module";
    }

    if (dataset.length === 0) {
      alert(`No records available in ${scopeLabel} to export.`);
      return;
    }

    const filename = `${moduleName}_${scope}_${getDateSlug()}`;
    const fullSubtitle = `${subtitle} | Scope: ${scopeLabel}`;

    if (format === "excel") {
      exportToExcel(dataset, columns, filename, moduleName.replace(/_/g, " "));
    } else if (format === "csv") {
      exportToCsv(dataset, columns, filename);
    } else if (format === "pdf") {
      exportToPdf(moduleTitle, fullSubtitle, dataset, columns, filename);
    }

    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 gap-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer"
        aria-expanded={isOpen}
      >
        <Download className="w-3.5 h-3.5 text-indigo-600" />
        <span>Export</span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl shadow-slate-200/60 border border-slate-200/90 z-50 p-3 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-1 pt-0.5 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Export Options
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Real Download</span>
          </div>

          {/* Section 1: Current View */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-800">1. Current View</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {currentViewData.length} records
              </span>
            </div>
            <p className="text-[11px] text-slate-400 px-1 leading-tight">
              Whatever filters are currently applied.
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleExport("Current_View", "excel")}
                disabled={currentViewData.length === 0}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Excel</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("Current_View", "csv")}
                disabled={currentViewData.length === 0}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <Table className="w-3 h-3" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("Current_View", "pdf")}
                disabled={currentViewData.length === 0}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Section 2: Selected Records */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-800">2. Selected Records</span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                  selectedData.length > 0
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                )}
              >
                {selectedData.length} selected
              </span>
            </div>
            {selectedData.length === 0 ? (
              <p className="text-[11px] text-amber-600 bg-amber-50/70 border border-amber-200/70 px-2 py-1 rounded-md">
                Select rows via checkboxes (□) to export.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleExport("Selected_Records", "excel")}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("Selected_Records", "csv")}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Table className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("Selected_Records", "pdf")}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-colors cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Entire Module */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-800">3. Entire Module</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {entireModuleData.length} records
              </span>
            </div>
            <p className="text-[11px] text-slate-400 px-1 leading-tight">
              Exports all registered records inside this module.
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleExport("Entire_Module", "excel")}
                disabled={entireModuleData.length === 0}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Excel</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("Entire_Module", "csv")}
                disabled={entireModuleData.length === 0}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <Table className="w-3 h-3" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport("Entire_Module", "pdf")}
                disabled={entireModuleData.length === 0}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
