import React from "react";
import { FlexibleStatus } from "@/types/flexible-membership";
import { cn } from "@/lib/utils";

interface FlexibleStatusBadgeProps {
  status: FlexibleStatus;
  className?: string;
}

export function FlexibleStatusBadge({ status, className }: FlexibleStatusBadgeProps) {
  const styles: Record<FlexibleStatus, { dot: string; bg: string; text: string; label: string }> = {
    Active: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-50 border-emerald-200/90",
      text: "text-emerald-700",
      label: "Active",
    },
    "Expiring Soon": {
      dot: "bg-amber-500 animate-pulse",
      bg: "bg-amber-50 border-amber-200/90",
      text: "text-amber-700 font-bold",
      label: "Expiring Soon",
    },
    Expired: {
      dot: "bg-rose-500",
      bg: "bg-rose-50 border-rose-200/90",
      text: "text-rose-700",
      label: "Expired",
    },
    Completed: {
      dot: "bg-indigo-500",
      bg: "bg-indigo-50 border-indigo-200/90",
      text: "text-indigo-700 font-bold",
      label: "Completed (30h)",
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
      {current.label}
    </span>
  );
}
