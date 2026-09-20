"use client";

import React from "react";
import { AdminSalesModule } from "@/components/sales/admin-sales-module";

export function AdminSales() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            PBA Store Management &amp; Reporting
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Retail transactions, inventory auditing, employee performance tracking, and shop revenue reporting.
          </p>
        </div>
      </div>

      {/* Main Admin Shop Module */}
      <AdminSalesModule />
    </div>
  );
}

export default AdminSales;
