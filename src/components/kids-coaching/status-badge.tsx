import React from "react";
import { StudentStatus } from "@/types/kids-coaching";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<StudentStatus, { dot: string; bg: string; text: string }> = {
    Active: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 border-emerald-200/80",
      text: "text-emerald-700",
    },
    Inactive: {
      dot: "bg-slate-400",
      bg: "bg-slate-50 border-slate-200",
      text: "text-slate-600",
    },
  };

  const current = styles[status] || styles.Active;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none whitespace-nowrap",
        current.bg,
        current.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", current.dot)} />
      {status}
    </span>
  );
}
