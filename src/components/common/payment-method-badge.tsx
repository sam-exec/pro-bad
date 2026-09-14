import React from "react";
import { PaymentMethod } from "@/types/payment";
import { cn } from "@/lib/utils";

interface PaymentMethodBadgeProps {
  method?: PaymentMethod | string;
  className?: string;
}

export function PaymentMethodBadge({ method, className }: PaymentMethodBadgeProps) {
  if (!method) {
    return <span className="text-slate-400 font-mono text-xs">—</span>;
  }

  const isUPI = method === "UPI";
  const isCash = method === "Cash";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold border select-none whitespace-nowrap",
        isUPI && "bg-blue-50 text-blue-700 border-blue-200",
        isCash && "bg-slate-100 text-slate-700 border-slate-200",
        !isUPI && !isCash && "bg-slate-50 text-slate-600 border-slate-200",
        className
      )}
    >
      {method}
    </span>
  );
}
