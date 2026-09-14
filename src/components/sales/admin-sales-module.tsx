"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  SALES_PRODUCT_LIST,
  SaleTransaction,
  SalesDateFilter,
} from "@/types/sales";
import { PaymentMethod } from "@/types/payment";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { salesManagementService } from "@/services/salesManagementService";
import { BRANCHES } from "@/config/branches";
import {
  Receipt,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Calendar,
  IndianRupee,
  Package,
  Users,
  Building,
  QrCode,
  Banknote,
  TrendingUp,
  Clock,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSalesModuleProps {
  selectedBranch: string;
}

export function AdminSalesModule({ selectedBranch }: AdminSalesModuleProps) {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Subscribe to sales service
  useEffect(() => {
    const unsub = salesManagementService.subscribe(() => {
      setUpdateTrigger((t) => t + 1);
    });
    return () => unsub();
  }, []);

  // Tabs: "all-sales" | "reports"
  const [activeTab, setActiveTab] = useState<"all-sales" | "reports">("all-sales");

  // Filter States
  const [branchFilter, setBranchFilter] = useState<string>(selectedBranch);
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | "all">("all");
  const [dateFilter, setDateFilter] = useState<SalesDateFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Reports Sub-Tab: "employee" | "product" | "daily" | "branch"
  const [reportType, setReportType] = useState<
    "employee" | "product" | "daily" | "branch"
  >("employee");

  // Keep branchFilter in sync if admin selects another branch from admin header
  useEffect(() => {
    setBranchFilter(selectedBranch);
  }, [selectedBranch]);

  // Admin summary statistics
  const summary = useMemo(() => {
    return salesManagementService.getAdminSummary(branchFilter);
  }, [branchFilter, updateTrigger]);

  // Filtered sales records
  const filteredSales = useMemo(() => {
    return salesManagementService.getAllSales({
      branchId: branchFilter,
      employeeId: employeeFilter,
      product: productFilter,
      paymentMethod: paymentMethodFilter,
      dateFilter,
      startDate,
      endDate,
      searchQuery,
    });
  }, [
    branchFilter,
    employeeFilter,
    productFilter,
    paymentMethodFilter,
    dateFilter,
    startDate,
    endDate,
    searchQuery,
    updateTrigger,
  ]);

  // Unique employees for employee filter dropdown
  const uniqueEmployees = useMemo(() => {
    const all = salesManagementService.getAllSales();
    const map = new Map<string, string>();
    all.forEach((s) => map.set(s.employeeId, `${s.employeeName} (${s.employeeId})`));
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [updateTrigger]);

  // 1. Employee-wise Report Data
  const employeeReportData = useMemo(() => {
    const map = new Map<
      string,
      {
        employeeId: string;
        employeeName: string;
        branchName: string;
        transactions: number;
        unitsSold: number;
        cashTotal: number;
        upiTotal: number;
        grandTotal: number;
      }
    >();

    filteredSales.forEach((s) => {
      const existing = map.get(s.employeeId) || {
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        branchName: s.branchName,
        transactions: 0,
        unitsSold: 0,
        cashTotal: 0,
        upiTotal: 0,
        grandTotal: 0,
      };
      existing.transactions += 1;
      existing.unitsSold += s.items.reduce((sum, i) => sum + i.quantity, 0);
      if (s.paymentMethod === "Cash") existing.cashTotal += s.grandTotal;
      if (s.paymentMethod === "UPI") existing.upiTotal += s.grandTotal;
      existing.grandTotal += s.grandTotal;
      map.set(s.employeeId, existing);
    });

    return Array.from(map.values());
  }, [filteredSales]);

  // 2. Product-wise Report Data
  const productReportData = useMemo(() => {
    const map = new Map<
      string,
      {
        product: string;
        transactions: number;
        quantitySold: number;
        totalRevenue: number;
      }
    >();

    filteredSales.forEach((s) => {
      s.items.forEach((i) => {
        const existing = map.get(i.product) || {
          product: i.product,
          transactions: 0,
          quantitySold: 0,
          totalRevenue: 0,
        };
        existing.transactions += 1;
        existing.quantitySold += i.quantity;
        existing.totalRevenue += i.lineTotal;
        map.set(i.product, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredSales]);

  // 3. Daily Sales Report Data
  const dailyReportData = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        transactions: number;
        unitsSold: number;
        cashRevenue: number;
        upiRevenue: number;
        totalRevenue: number;
      }
    >();

    filteredSales.forEach((s) => {
      const existing = map.get(s.date) || {
        date: s.date,
        transactions: 0,
        unitsSold: 0,
        cashRevenue: 0,
        upiRevenue: 0,
        totalRevenue: 0,
      };
      existing.transactions += 1;
      existing.unitsSold += s.items.reduce((sum, i) => sum + i.quantity, 0);
      if (s.paymentMethod === "Cash") existing.cashRevenue += s.grandTotal;
      if (s.paymentMethod === "UPI") existing.upiRevenue += s.grandTotal;
      existing.totalRevenue += s.grandTotal;
      map.set(s.date, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredSales]);

  // 4. Branch-wise Report Data
  const branchReportData = useMemo(() => {
    const map = new Map<
      string,
      {
        branchId: string;
        branchName: string;
        transactions: number;
        unitsSold: number;
        cashRevenue: number;
        upiRevenue: number;
        totalRevenue: number;
      }
    >();

    filteredSales.forEach((s) => {
      const existing = map.get(s.branchId) || {
        branchId: s.branchId,
        branchName: s.branchName,
        transactions: 0,
        unitsSold: 0,
        cashRevenue: 0,
        upiRevenue: 0,
        totalRevenue: 0,
      };
      existing.transactions += 1;
      existing.unitsSold += s.items.reduce((sum, i) => sum + i.quantity, 0);
      if (s.paymentMethod === "Cash") existing.cashRevenue += s.grandTotal;
      if (s.paymentMethod === "UPI") existing.upiRevenue += s.grandTotal;
      existing.totalRevenue += s.grandTotal;
      map.set(s.branchId, existing);
    });

    return Array.from(map.values());
  }, [filteredSales]);

  // Admin Export to Excel
  const handleExportExcel = () => {
    if (activeTab === "all-sales") {
      const headers = [
        "Date",
        "Time",
        "Invoice #",
        "Employee Name",
        "Employee ID",
        "Branch",
        "Customer Name",
        "Customer Phone",
        "Product",
        "Brand / Model",
        "Size / Variant",
        "Quantity",
        "Unit Price (₹)",
        "Line Total (₹)",
        "Payment Method",
        "Grand Total (₹)",
      ];

      const rows: (string | number)[][] = [];
      filteredSales.forEach((s) => {
        s.items.forEach((i) => {
          rows.push([
            s.date,
            s.time,
            s.invoiceNumber,
            s.employeeName,
            s.employeeId,
            s.branchName,
            s.customerName,
            s.customerPhone,
            i.product,
            i.brandModel,
            i.sizeVariant,
            i.quantity,
            i.unitPrice,
            i.lineTotal,
            s.paymentMethod,
            s.grandTotal,
          ]);
        });
      });

      salesManagementService.exportToCSV("Admin_All_Sales_Records", headers, rows);
    } else {
      // Export current report tab
      if (reportType === "employee") {
        const headers = [
          "Employee ID",
          "Employee Name",
          "Branch",
          "Transactions",
          "Units Sold",
          "Cash Sales (₹)",
          "UPI Sales (₹)",
          "Grand Total (₹)",
        ];
        const rows = employeeReportData.map((e) => [
          e.employeeId,
          e.employeeName,
          e.branchName,
          e.transactions,
          e.unitsSold,
          e.cashTotal.toFixed(2),
          e.upiTotal.toFixed(2),
          e.grandTotal.toFixed(2),
        ]);
        salesManagementService.exportToCSV("Employee_Wise_Sales_Report", headers, rows);
      } else if (reportType === "product") {
        const headers = [
          "Product Name",
          "Transactions",
          "Units Sold",
          "Total Revenue (₹)",
        ];
        const rows = productReportData.map((p) => [
          p.product,
          p.transactions,
          p.quantitySold,
          p.totalRevenue.toFixed(2),
        ]);
        salesManagementService.exportToCSV("Product_Wise_Sales_Report", headers, rows);
      } else if (reportType === "daily") {
        const headers = [
          "Date",
          "Transactions",
          "Units Sold",
          "Cash Revenue (₹)",
          "UPI Revenue (₹)",
          "Total Revenue (₹)",
        ];
        const rows = dailyReportData.map((d) => [
          d.date,
          d.transactions,
          d.unitsSold,
          d.cashRevenue.toFixed(2),
          d.upiRevenue.toFixed(2),
          d.totalRevenue.toFixed(2),
        ]);
        salesManagementService.exportToCSV("Daily_Sales_Report", headers, rows);
      } else if (reportType === "branch") {
        const headers = [
          "Branch ID",
          "Branch Name",
          "Transactions",
          "Units Sold",
          "Cash Revenue (₹)",
          "UPI Revenue (₹)",
          "Total Revenue (₹)",
        ];
        const rows = branchReportData.map((b) => [
          b.branchId,
          b.branchName,
          b.transactions,
          b.unitsSold,
          b.cashRevenue.toFixed(2),
          b.upiRevenue.toFixed(2),
          b.totalRevenue.toFixed(2),
        ]);
        salesManagementService.exportToCSV("Branch_Wise_Sales_Report", headers, rows);
      }
    }
  };

  // Admin Export to PDF
  const handleExportPDF = () => {
    let reportTitle = "Admin Sales Report";
    let tableHtml = "";

    if (activeTab === "all-sales") {
      reportTitle = "Master Sales Transactions Report";
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice #</th>
              <th>Employee</th>
              <th>Branch</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Payment</th>
              <th class="text-right">Grand Total</th>
            </tr>
          </thead>
          <tbody>
            ${filteredSales
              .map(
                (s) => `
              <tr>
                <td>${s.date} ${s.time}</td>
                <td>${s.invoiceNumber}</td>
                <td>${s.employeeName}</td>
                <td>${s.branchName}</td>
                <td>${s.customerName} (${s.customerPhone})</td>
                <td>${s.items.map((i) => `${i.quantity}x ${i.product}`).join(", ")}</td>
                <td>${s.paymentMethod}</td>
                <td class="text-right">₹${s.grandTotal.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    } else if (reportType === "employee") {
      reportTitle = "Employee-Wise Sales Report";
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch</th>
              <th class="text-right">Transactions</th>
              <th class="text-right">Units Sold</th>
              <th class="text-right">Cash (₹)</th>
              <th class="text-right">UPI (₹)</th>
              <th class="text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${employeeReportData
              .map(
                (e) => `
              <tr>
                <td>${e.employeeName} (${e.employeeId})</td>
                <td>${e.branchName}</td>
                <td class="text-right">${e.transactions}</td>
                <td class="text-right">${e.unitsSold}</td>
                <td class="text-right">₹${e.cashTotal.toFixed(2)}</td>
                <td class="text-right">₹${e.upiTotal.toFixed(2)}</td>
                <td class="text-right font-bold">₹${e.grandTotal.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    } else if (reportType === "product") {
      reportTitle = "Product-Wise Sales Report";
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th class="text-right">Transactions</th>
              <th class="text-right">Total Units Sold</th>
              <th class="text-right">Total Revenue (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${productReportData
              .map(
                (p) => `
              <tr>
                <td>${p.product}</td>
                <td class="text-right">${p.transactions}</td>
                <td class="text-right">${p.quantitySold}</td>
                <td class="text-right font-bold">₹${p.totalRevenue.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    } else if (reportType === "daily") {
      reportTitle = "Daily Sales Records Report";
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th class="text-right">Transactions</th>
              <th class="text-right">Units Sold</th>
              <th class="text-right">Cash (₹)</th>
              <th class="text-right">UPI (₹)</th>
              <th class="text-right">Total Revenue (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${dailyReportData
              .map(
                (d) => `
              <tr>
                <td>${d.date}</td>
                <td class="text-right">${d.transactions}</td>
                <td class="text-right">${d.unitsSold}</td>
                <td class="text-right">₹${d.cashRevenue.toFixed(2)}</td>
                <td class="text-right">₹${d.upiRevenue.toFixed(2)}</td>
                <td class="text-right font-bold">₹${d.totalRevenue.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    } else if (reportType === "branch") {
      reportTitle = "Branch-Wise Sales Report";
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Branch</th>
              <th class="text-right">Transactions</th>
              <th class="text-right">Units Sold</th>
              <th class="text-right">Cash (₹)</th>
              <th class="text-right">UPI (₹)</th>
              <th class="text-right">Total Revenue (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${branchReportData
              .map(
                (b) => `
              <tr>
                <td>${b.branchName} (${b.branchId})</td>
                <td class="text-right">${b.transactions}</td>
                <td class="text-right">${b.unitsSold}</td>
                <td class="text-right">₹${b.cashRevenue.toFixed(2)}</td>
                <td class="text-right">₹${b.upiRevenue.toFixed(2)}</td>
                <td class="text-right font-bold">₹${b.totalRevenue.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;
    }

    salesManagementService.exportToPDF(
      reportTitle,
      `Pro Badminton Admin Reporting System • Branch: ${branchFilter === "all" ? "All Branches" : branchFilter}`,
      tableHtml
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. ADMIN DASHBOARD SUMMARY (TOP WIDGETS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Transactions
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {summary.totalTransactions}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Across selected branch
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products Sold */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Products Sold
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1 block">
              {summary.totalProductsSold}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Total merchandise units
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Employee-wise Sales Summary Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Active Sales Staff
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 mt-1 block">
              {summary.employeeSummary.length}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate block max-w-[150px]">
              {summary.employeeSummary.map((e) => e.employeeName.split(" ")[0]).join(", ") || "No staff"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Branch-wise Sales Summary / Total Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Revenue
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              ₹{summary.totalSalesAmount.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {summary.branchSummary.length} Branch{summary.branchSummary.length !== 1 ? "es" : ""} active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION BAR & EXPORT ACTIONS */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("all-sales")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "all-sales"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>All Sales Records ({filteredSales.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "reports"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Admin Reports &amp; Analytics</span>
          </button>
        </div>

        {/* Global Export Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* 3. ADMIN FILTERS BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
          {/* Search Query */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, phone, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:bg-white"
            >
              <option value="all">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} Branch
                </option>
              ))}
            </select>
          </div>

          {/* Employee Filter */}
          <div>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:bg-white"
            >
              <option value="all">All Employees</option>
              {uniqueEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product Filter (from 28 list) */}
          <div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:bg-white"
            >
              <option value="all">All Products (28 Items)</option>
              {SALES_PRODUCT_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <PaymentMethodFilter
              value={paymentMethodFilter}
              onChange={setPaymentMethodFilter}
            />
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as SalesDateFilter)}
              className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:bg-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>

        {/* Custom date range picker if selected */}
        {dateFilter === "custom" && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
            />
            <span className="font-bold text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
            />
          </div>
        )}
      </div>

      {/* 4. TAB 1: ALL SALES RECORDS TABLE */}
      {activeTab === "all-sales" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Customer Phone</th>
                  <th className="py-3 px-4">Products Sold</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-600">
                        No sales records found matching the active filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{s.date}</span>
                        <span className="text-[10px] text-slate-400">{s.time}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{s.employeeName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{s.employeeId}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          {s.branchName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {s.customerName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {s.customerPhone}
                      </td>
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="space-y-0.5">
                          {s.items.map((i, idx) => (
                            <div key={idx} className="text-[11px] text-slate-700">
                              <span className="font-bold">{i.quantity}x</span> {i.product}{" "}
                              {i.brandModel ? `(${i.brandModel})` : ""}{" "}
                              <span className="text-slate-400 font-mono">
                                (₹{i.lineTotal.toFixed(2)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <PaymentMethodBadge method={s.paymentMethod} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 font-mono text-sm">
                        ₹{s.grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 2: ADMIN REPORTS & ANALYTICS */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          {/* Sub-Tabs: Employee-wise / Product-wise / Daily / Branch-wise */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: "employee", label: "Employee-wise Sales" },
              { id: "product", label: "Product-wise Sales" },
              { id: "daily", label: "Daily Sales Records" },
              { id: "branch", label: "Branch-wise Sales" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReportType(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  reportType === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Report 1: Employee-wise Sales */}
          {reportType === "employee" && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Employee-wise Sales Performance</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Aggregated from {filteredSales.length} transactions
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4 text-center">Transactions</th>
                      <th className="py-3 px-4 text-center">Units Sold</th>
                      <th className="py-3 px-4 text-right">Cash Sales</th>
                      <th className="py-3 px-4 text-right">UPI Sales</th>
                      <th className="py-3 px-4 text-right">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {employeeReportData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No employee sales data found.
                        </td>
                      </tr>
                    ) : (
                      employeeReportData.map((e) => (
                        <tr key={e.employeeId} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{e.employeeName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{e.employeeId}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{e.branchName}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900">{e.transactions}</td>
                          <td className="py-3 px-4 text-center font-bold text-indigo-600">{e.unitsSold}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{e.cashTotal.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{e.upiTotal.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                            ₹{e.grandTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report 2: Product-wise Sales */}
          {reportType === "product" && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Product-wise Sales Performance</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Ranked by Total Revenue
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4 text-center">Transactions Count</th>
                      <th className="py-3 px-4 text-center">Total Units Sold</th>
                      <th className="py-3 px-4 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {productReportData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No product sales recorded yet.
                        </td>
                      </tr>
                    ) : (
                      productReportData.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">{p.product}</td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-700">{p.transactions}</td>
                          <td className="py-3 px-4 text-center font-bold text-indigo-600">{p.quantitySold}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                            ₹{p.totalRevenue.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report 3: Daily Sales Records */}
          {reportType === "daily" && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Daily Sales Timeline</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Aggregated by Date
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-center">Transactions</th>
                      <th className="py-3 px-4 text-center">Units Sold</th>
                      <th className="py-3 px-4 text-right">Cash Revenue</th>
                      <th className="py-3 px-4 text-right">UPI Revenue</th>
                      <th className="py-3 px-4 text-right">Daily Revenue Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {dailyReportData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No daily sales data available.
                        </td>
                      </tr>
                    ) : (
                      dailyReportData.map((d) => (
                        <tr key={d.date} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">{d.date}</td>
                          <td className="py-3 px-4 text-center font-bold">{d.transactions}</td>
                          <td className="py-3 px-4 text-center font-bold text-indigo-600">{d.unitsSold}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{d.cashRevenue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{d.upiRevenue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                            ₹{d.totalRevenue.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report 4: Branch-wise Sales */}
          {reportType === "branch" && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Branch-wise Sales Performance</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Multi-Branch Comparison
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Branch Name</th>
                      <th className="py-3 px-4 text-center">Transactions</th>
                      <th className="py-3 px-4 text-center">Total Units Sold</th>
                      <th className="py-3 px-4 text-right">Cash Revenue</th>
                      <th className="py-3 px-4 text-right">UPI Revenue</th>
                      <th className="py-3 px-4 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {branchReportData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No branch sales data available.
                        </td>
                      </tr>
                    ) : (
                      branchReportData.map((b) => (
                        <tr key={b.branchId} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {b.branchName}
                            <span className="text-[10px] font-mono text-slate-400 ml-1.5">
                              ({b.branchId})
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">{b.transactions}</td>
                          <td className="py-3 px-4 text-center font-bold text-indigo-600">{b.unitsSold}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{b.cashRevenue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{b.upiRevenue.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                            ₹{b.totalRevenue.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default AdminSalesModule;
