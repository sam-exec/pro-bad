import React from "react";
import { cn } from "@/lib/utils";

interface HoursProgressBarProps {
  totalHours: number;
  hoursUsed: number;
  showLabels?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function HoursProgressBar({
  totalHours = 30,
  hoursUsed,
  showLabels = true,
  className,
  size = "md",
}: HoursProgressBarProps) {
  const safeTotal = totalHours > 0 ? totalHours : 30;
  const percentage = Math.min(100, Math.round((hoursUsed / safeTotal) * 100));
  const remaining = Math.max(0, safeTotal - hoursUsed);

  const barHeight = {
    sm: "h-2",
    md: "h-2.5",
    lg: "h-3.5",
  }[size];

  // Dynamic progress bar color
  const barColor =
    percentage >= 100
      ? "bg-indigo-600"
      : percentage >= 75
      ? "bg-amber-500"
      : "bg-blue-600";

  return (
    <div className={cn("w-full space-y-1.5 select-none", className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            {hoursUsed} / {safeTotal} Hours Used
          </span>
          <span className="font-bold text-slate-900">
            {remaining}h Remaining ({percentage}%)
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={cn(
          "w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200/80 shadow-2xs",
          barHeight
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
