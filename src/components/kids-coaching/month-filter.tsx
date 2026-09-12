import React from "react";
import { MONTHS, YEARS } from "@/types/kids-coaching";
import { Calendar } from "lucide-react";

interface MonthFilterProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function MonthFilter({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
}: MonthFilterProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Month Dropdown */}
      <div className="relative">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-xs cursor-pointer appearance-none"
        >
          <option value="All">All Months</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {/* Year Dropdown */}
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-xs cursor-pointer appearance-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
