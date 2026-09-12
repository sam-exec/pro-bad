import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-red-500 focus-visible:ring-red-500/30 border-red-500/90 text-red-950"
            : "border-slate-200 focus-visible:border-blue-600 focus-visible:ring-blue-600/20",
          className
        )}
        ref={ref}
        aria-invalid={hasError ? "true" : undefined}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
