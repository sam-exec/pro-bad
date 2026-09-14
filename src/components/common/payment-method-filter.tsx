import React from "react";
import { cn } from "@/lib/utils";

interface PaymentMethodFilterProps {
  value?: string;
  onChange?: (val: any) => void;
  selectedMethod?: string; // "All" | "Cash" | "UPI"
  onMethodChange?: (method: string) => void;
  className?: string;
}

export function PaymentMethodFilter({
  value,
  onChange,
  selectedMethod,
  onMethodChange,
  className,
}: PaymentMethodFilterProps) {
  const activeMethod = value ?? selectedMethod ?? "All";

  const handleChange = (newVal: string) => {
    onChange?.(newVal);
    onMethodChange?.(newVal);
  };

  return (
    <div className={cn("relative", className)}>
      <select
        value={activeMethod}
        onChange={(e) => handleChange(e.target.value)}
        className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-xs cursor-pointer appearance-none"
        aria-label="Filter by Payment Method"
      >
        <option value={activeMethod === "all" ? "all" : "All"}>All Methods</option>
        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
