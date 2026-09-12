import React from "react";
import { PaymentStatus } from "@/types/kids-coaching";
import { cn } from "@/lib/utils";

interface PaymentBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const styles: Record<PaymentStatus, { bg: string; text: string; border: string }> = {
    Paid: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    Partial: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    Pending: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
  };

  const current = styles[status] || styles.Paid;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold border select-none whitespace-nowrap",
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {status}
    </span>
  );
}
