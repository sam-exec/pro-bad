"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import {
  SALES_PRODUCT_LIST,
  SaleLineItem,
  SaleTransaction,
  SalesPaymentMethod,
  SalesDateFilter,
} from "@/types/sales";
import { salesManagementService } from "@/services/salesManagementService";
import { inventoryService } from "@/services/inventoryService";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Calendar,
  FileSpreadsheet,
  Printer,
  Receipt,
  User,
  Phone,
  Banknote,
  QrCode,
  Clock,
  MapPin,
  Check,
  ShoppingBag,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { PaymentMethodFilter } from "@/components/common/payment-method-filter";
import { UniversalSearch } from "@/components/ui/universal-search";


interface LineItemFormState {
  id: string;
  product: string;
  brandModel: string;
  sizeVariant: string;
  quantity: number | string;
  unitPrice: number | string;
}

export function EmployeeSalesModule() {
  const { employeeId, employeeName } = useAuth();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [currentDate, setCurrentDate] = useState("Today (Live)");

  // Subscribe to sales service and inventory service
  useEffect(() => {
    setCurrentDate(`${new Date().toLocaleDateString()} (Live)`);
    const unsubSales = salesManagementService.subscribe(() => {
      setUpdateTrigger((t) => t + 1);
    });
    const unsubInv = inventoryService.subscribe(() => {
      setUpdateTrigger((t) => t + 1);
    });
    return () => {
      unsubSales();
      unsubInv();
    };
  }, []);

  // Custom product names added by employees — persisted in localStorage
  const CUSTOM_PRODUCTS_KEY = "pba_custom_sale_products";
  const [customProductNames, setCustomProductNames] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Canonical product list: fixed 28 categories + any custom names added by employees
  // NOTE: deliberately does NOT read from inventoryService — inventory holds stock/pricing
  // data for the Inventory module; the sale form uses category-level names only.
  const availableProducts = useMemo(() => {
    const base = [...SALES_PRODUCT_LIST] as string[];
    const merged = [...base];
    customProductNames.forEach((name) => {
      if (!merged.includes(name)) merged.push(name);
    });
    return merged.map((name) => ({ name, price: 0, currentStock: 0 }));
  }, [customProductNames]);

  // Record Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<SalesPaymentMethod>("UPI");
  const [items, setItems] = useState<LineItemFormState[]>([
    {
      id: crypto.randomUUID(),
      product: SALES_PRODUCT_LIST[0],
      brandModel: "",
      sizeVariant: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  // Inline "Add product name" quick-entry dialog
  const [isAddNameModalOpen, setIsAddNameModalOpen] = useState(false);
  const [pendingAddProductIndex, setPendingAddProductIndex] = useState<number | null>(null);
  const [addProductNameInput, setAddProductNameInput] = useState("");

  const handleConfirmAddProductName = () => {
    const trimmed = addProductNameInput.trim().toUpperCase();
    if (!trimmed) return;
    const allNames = [...SALES_PRODUCT_LIST as unknown as string[], ...customProductNames];
    let updated = customProductNames;
    if (!allNames.includes(trimmed)) {
      // Persist to localStorage so it's available in every future session
      updated = [...customProductNames, trimmed];
      setCustomProductNames(updated);
      try {
        localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated));
      } catch { /* ignore */ }
    }
    // Select the new (or existing) product in the line item that triggered the action
    if (pendingAddProductIndex !== null) {
      setItems((prev) => {
        const next = [...prev];
        next[pendingAddProductIndex] = {
          ...next[pendingAddProductIndex],
          product: trimmed,
          unitPrice: "",
        };
        return next;
      });
    }
    setAddProductNameInput("");
    setPendingAddProductIndex(null);
    setIsAddNameModalOpen(false);
  };

  // History Filter States
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFilter, setHistoryDateFilter] = useState<SalesDateFilter>("all");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historyPaymentMethod, setHistoryPaymentMethod] = useState<string>("All");

  // Report Filter States
  const [reportDateFilter, setReportDateFilter] = useState<SalesDateFilter>("month");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");

  // Grand total calculation for form
  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return sum + q * p;
    }, 0);
  }, [items]);

  // Handle line item modifications
  const handleAddItem = () => {
    const defaultProduct = availableProducts[0]?.name || SALES_PRODUCT_LIST[0];
    const defaultPrice = availableProducts[0]?.price || 0;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        product: defaultProduct,
        brandModel: "",
        sizeVariant: "",
        quantity: 1,
        unitPrice: defaultPrice,
      },
    ]);
  };

  const confirmRemoveItem = () => {
    if (pendingRemoveIndex === null) return;
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== pendingRemoveIndex);
    });
    setPendingRemoveIndex(null);
  };

  const handleItemChange = (
    index: number,
    field: keyof LineItemFormState,
    value: any
  ) => {
    // Intercept the sentinel value — open inline name-entry dialog
    if (field === "product" && value === "__ADD_PRODUCT__") {
      setPendingAddProductIndex(index);
      setAddProductNameInput("");
      setIsAddNameModalOpen(true);
      return;
    }
    setItems((prev) => {
      const next = [...prev];
      if (field === "product") {
        const found = availableProducts.find((p) => p.name === value);
        next[index] = {
          ...next[index],
          product: value,
          // Price is always entered manually for category-level products
          unitPrice: "",
        };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  // Submit Sale / Complete Purchase
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!customerName.trim()) {
      setErrorMessage("Customer Name is required.");
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage("Customer Phone Number is required.");
      return;
    }
    if (items.some((i) => !i.quantity || Number(i.quantity) <= 0)) {
      setErrorMessage("Quantity must be greater than 0 for all products.");
      return;
    }
    if (items.some((i) => i.unitPrice === "" || Number(i.unitPrice) < 0 || isNaN(Number(i.unitPrice)))) {
      setErrorMessage("Unit Price cannot be negative.");
      return;
    }

    // Price guard — block silent ₹0 checkout
    const zeroPriceItem = items.find((i) => i.unitPrice === "" || Number(i.unitPrice) === 0);
    if (zeroPriceItem) {
      setErrorMessage(
        `Price for "${zeroPriceItem.product}" is not set. Please enter a unit price before completing the sale.`
      );
      return;
    }

    // Inventory Stock Validation Guard (Strict: Never allow negative inventory)
    for (const item of items) {
      const q = Number(item.quantity) || 1;
      const stockCheck = inventoryService.checkStock(item.product, q);
      if (!stockCheck.available) {
        setErrorMessage(
          `Insufficient inventory stock for "${item.product}". Current stock: ${stockCheck.currentStock} units. Purchase cannot exceed available stock.`
        );
        return;
      }
    }

    try {
      const saved = salesManagementService.createSale({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: items.map((i) => ({
          product: i.product,
          brandModel: i.brandModel.trim() || "Standard",
          sizeVariant: i.sizeVariant.trim() || "Regular",
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice) || 0,
        })),
        paymentMethod,
        employeeId,
        employeeName,
      });

      setSuccessMessage(
        `Transaction completed successfully! Invoice #${saved.invoiceNumber} — Total: ₹${saved.grandTotal.toFixed(2)} (${saved.paymentMethod}). Inventory updated.`
      );

      // Reset form
      const defProd = availableProducts[0]?.name || SALES_PRODUCT_LIST[0];
      const defPrice = availableProducts[0]?.price || 0;
      setCustomerName("");
      setCustomerPhone("");
      setItems([
        {
          id: crypto.randomUUID(),
          product: defProd,
          brandModel: "",
          sizeVariant: "",
          quantity: 1,
          unitPrice: defPrice,
        },
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to record transaction.");
    }
  };

  // Filtered History for this employee
  const mySalesHistory = useMemo(() => {
    return salesManagementService.getSalesByEmployee(employeeId, {
      searchQuery: historySearch,
      dateFilter: historyDateFilter,
      startDate: historyStartDate,
      endDate: historyEndDate,
      paymentMethod: historyPaymentMethod as any,
    });
  }, [
    employeeId,
    historySearch,
    historyDateFilter,
    historyStartDate,
    historyEndDate,
    historyPaymentMethod,
    updateTrigger,
  ]);

  // Filtered Sales for Report
  const myReportSales = useMemo(() => {
    return salesManagementService.getSalesByEmployee(employeeId, {
      dateFilter: reportDateFilter,
      startDate: reportStartDate,
      endDate: reportEndDate,
    });
  }, [employeeId, reportDateFilter, reportStartDate, reportEndDate, updateTrigger]);

  // Report Summary Aggregation
  const reportTotals = useMemo(() => {
    const totalTransactions = myReportSales.length;
    const totalProductsSold = myReportSales.reduce(
      (sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0),
      0
    );
    const grandTotalSales = myReportSales.reduce((sum, s) => sum + s.grandTotal, 0);

    // Product-wise breakdown
    const productBreakdown = new Map<string, { qty: number; amount: number }>();
    myReportSales.forEach((s) => {
      s.items.forEach((item) => {
        const existing = productBreakdown.get(item.product) || { qty: 0, amount: 0 };
        existing.qty += item.quantity;
        existing.amount += item.lineTotal;
        productBreakdown.set(item.product, existing);
      });
    });

    return {
      totalTransactions,
      totalProductsSold,
      grandTotalSales: Math.round(grandTotalSales * 100) / 100,
      productBreakdown: Array.from(productBreakdown.entries()).map(
        ([product, data]) => ({
          product,
          qty: data.qty,
          amount: Math.round(data.amount * 100) / 100,
        })
      ),
    };
  }, [myReportSales]);

  // Export to Excel handler
  const handleExportExcel = () => {
    const headers = [
      "Date",
      "Time",
      "Invoice #",
      "Customer Name",
      "Customer Phone",
      "Product",
      "Brand / Model",
      "Size / Variant",
      "Quantity",
      "Unit Price (₹)",
      "Line Total (₹)",
      "Grand Total (₹)",
      "Payment Method",
      "Employee ID",
      "Employee Name",
    ];

    const rows: (string | number)[][] = [];
    myReportSales.forEach((s) => {
      s.items.forEach((i) => {
        rows.push([
          s.date,
          s.time,
          s.invoiceNumber,
          s.customerName,
          s.customerPhone,
          i.product,
          i.brandModel,
          i.sizeVariant,
          i.quantity,
          i.unitPrice,
          i.lineTotal,
          s.grandTotal,
          s.paymentMethod,
          s.employeeId,
          s.employeeName,
        ]);
      });
    });

    salesManagementService.exportToCSV(
      `PRO_BD_Shop_Report_${employeeId}_${reportDateFilter}`,
      headers,
      rows
    );
  };

  // Export to PDF handler
  const handleExportPDF = () => {
    const dateRangeLabel =
      reportDateFilter === "today"
        ? "Today"
        : reportDateFilter === "week"
        ? "This Week"
        : reportDateFilter === "month"
        ? "This Month"
        : `${reportStartDate || "Start"} to ${reportEndDate || "End"}`;

    const htmlContent = `
      <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background-color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div><strong>Employee:</strong> ${employeeName} (${employeeId})</div>
          <div><strong>Period:</strong> ${dateRangeLabel}</div>
        </div>
        <div style="display: flex; gap: 24px; margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
          <div><strong>Total Transactions:</strong> ${reportTotals.totalTransactions}</div>
          <div><strong>Total Products Sold:</strong> ${reportTotals.totalProductsSold}</div>
          <div><strong>Grand Total Revenue:</strong> ₹${reportTotals.grandTotalSales.toFixed(2)}</div>
        </div>
      </div>

      <h3 style="margin-top: 24px; font-size: 14px;">Product-wise Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th class="text-right">Quantity Sold</th>
            <th class="text-right">Total Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${reportTotals.productBreakdown
            .map(
              (p) => `
            <tr>
              <td>${p.product}</td>
              <td class="text-right">${p.qty}</td>
              <td class="text-right">₹${p.amount.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
          <tr class="total-row">
            <td>Grand Total</td>
            <td class="text-right">${reportTotals.totalProductsSold}</td>
            <td class="text-right">₹${reportTotals.grandTotalSales.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <h3 style="margin-top: 30px; font-size: 14px;">Detailed Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Products Sold</th>
            <th>Payment</th>
            <th class="text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${myReportSales
            .map(
              (s) => `
            <tr>
              <td>${s.date} ${s.time}</td>
              <td>${s.invoiceNumber}</td>
              <td>${s.customerName}<br/><span style="color:#64748b; font-size:10px;">${s.customerPhone}</span></td>
              <td>${s.items.map((i) => `${i.quantity}x ${i.product} (${i.brandModel || "Std"} - ${i.sizeVariant || "Reg"})`).join(", ")}</td>
              <td>${s.paymentMethod}</td>
              <td class="text-right">₹${s.grandTotal.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    salesManagementService.exportToPDF(
      "Employee PBA Store Report",
      `Employee: ${employeeName}`,
      htmlContent
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              PBA Store Management &amp; Invoicing
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>PBA Store</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Record shop counter billing, track personal transaction history, and generate export statements.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2.5">
          <span className="font-semibold">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1 & 2. RECORD SALE FORM */}
      <form onSubmit={handleSaveSale} className="space-y-6">
        {/* Customer & Payment Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Customer &amp; Payment Details</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>{employeeName} ({employeeId})</span>
              </span>
            </div>
          </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Reddy"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Customer Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Payment Method * (Immediate)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all",
                      paymentMethod === "UPI"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Cash")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all",
                      paymentMethod === "Cash"
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Automatic Data Capture Banner */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium bg-slate-50/50 p-2.5 rounded-xl">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Automatic Capture:
              </span>
              <span>Operator: <b>{employeeName} ({employeeId})</b></span>
              <span>Date &amp; Time: <b>{currentDate}</b></span>
              <span className="text-emerald-700 font-bold ml-auto flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Immediate Full Payment
              </span>
            </div>
          </div>

          {/* Section B: Product Line Items (Supports multiple products) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>2. Products Sold ({items.length} Item{items.length !== 1 ? "s" : ""})</span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Product</span>
              </button>
            </div>

            {/* Line Items Table/List */}
            <div className="space-y-3">
              {items.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Product #{idx + 1}
                      </span>
                      {items.length > 1 && idx > 0 && (
                        <button
                          type="button"
                          onClick={() => setPendingRemoveIndex(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                          title="Remove this product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Product Dropdown (from inventory or category list) */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Product *
                        </label>
                        <select
                          value={item.product}
                          onChange={(e) =>
                            handleItemChange(idx, "product", e.target.value)
                          }
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          {availableProducts.map((prod) => {
                            const hasPrice = prod.price > 0;
                            const label = hasPrice
                              ? `${prod.name}  ·  ₹${prod.price}  (Stock: ${prod.currentStock})`
                              : prod.name;
                            return (
                              <option key={prod.name} value={prod.name}>
                                {label}
                              </option>
                            );
                          })}
                          {/* Divider */}
                          <option disabled value="">──────────────</option>
                          {/* Quick action — intercepted in handleItemChange */}
                          <option value="__ADD_PRODUCT__">➕ Add product</option>
                        </select>
                        {(() => {
                          const stockItem = availableProducts.find((p) => p.name === item.product);
                          if (!stockItem) return null;
                          const stock = stockItem.currentStock;
                          const hasPrice = stockItem.price > 0;
                          const isOverdraft = Number(item.quantity) > stock;
                          return (
                            <div className="flex items-center justify-between text-[10px] mt-1 px-0.5">
                              <span
                                className={cn(
                                  "font-semibold",
                                  !hasPrice
                                    ? "text-amber-600"
                                    : stock > 5
                                    ? "text-emerald-700"
                                    : stock > 0
                                    ? "text-amber-700"
                                    : "text-rose-600"
                                )}
                              >
                                {!hasPrice
                                  ? "Price not set — enter manually"
                                  : `Stock: ${stock} units${stock <= 0 ? " (Out of Stock)" : ""}`}
                              </span>
                              {hasPrice && isOverdraft && (
                                <span className="text-rose-600 font-bold">
                                  Exceeds stock!
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Brand / Model */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Brand / Model
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Astrox 100ZZ"
                          value={item.brandModel}
                          onChange={(e) =>
                            handleItemChange(idx, "brandModel", e.target.value)
                          }
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      {/* Size / Variant */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Size / Variant
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 4U G5 / UK 9"
                          value={item.sizeVariant}
                          onChange={(e) =>
                            handleItemChange(idx, "sizeVariant", e.target.value)
                          }
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Qty *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              handleItemChange(idx, "quantity", "");
                              return;
                            }
                            const parsed = parseInt(val, 10);
                            handleItemChange(
                              idx,
                              "quantity",
                              isNaN(parsed) ? "" : parsed
                            );
                          }}
                          onBlur={() => {
                            if (!item.quantity || Number(item.quantity) < 1) {
                              handleItemChange(idx, "quantity", 1);
                            }
                          }}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-center"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.unitPrice}
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              handleItemChange(idx, "unitPrice", "");
                              return;
                            }
                            // Strip accidental leading zeros if typed e.g. "01600" -> "1600"
                            let normalized = val;
                            if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
                              normalized = String(parseFloat(val));
                            }
                            handleItemChange(idx, "unitPrice", normalized);
                          }}
                          onBlur={() => {
                            if (
                              item.unitPrice === "" ||
                              isNaN(Number(item.unitPrice)) ||
                              Number(item.unitPrice) < 0
                            ) {
                              handleItemChange(idx, "unitPrice", 0);
                            } else {
                              handleItemChange(idx, "unitPrice", Number(item.unitPrice));
                            }
                          }}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-right"
                        />
                      </div>

                      {/* Line Total */}
                      <div className="sm:col-span-2 text-right">
                        <span className="block text-[10px] font-bold uppercase text-slate-400">
                          Line Total
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          ₹{lineTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions & Grand Total */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-6 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black text-emerald-700 tracking-tight">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Purchase (₹{grandTotal.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* 3. MY TRANSACTION HISTORY */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>3. My Transaction History ({mySalesHistory.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Transactions recorded by you
            </span>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <UniversalSearch
              value={historySearch}
              onChange={setHistorySearch}
              placeholder="Search by customer name, phone, or product..."
            />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Date:</span>
              <select
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value as SalesDateFilter)}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>

              {historyDateFilter === "custom" && (
                <div className="flex items-center gap-1 text-xs">
                  <input
                    type="date"
                    value={historyStartDate}
                    onChange={(e) => setHistoryStartDate(e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={historyEndDate}
                    onChange={(e) => setHistoryEndDate(e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              )}

              <PaymentMethodFilter
                selectedMethod={historyPaymentMethod}
                onMethodChange={setHistoryPaymentMethod}
              />
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
                  <tr>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Customer Phone</th>
                    <th className="py-3 px-4">Products Sold</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {mySalesHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-600">
                          No transactions recorded matching your filters.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Record customer purchases using the shop register above!
                        </p>
                      </td>
                    </tr>
                  ) : (
                    mySalesHistory.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900 block">{s.date}</span>
                          <span className="text-[10px] text-slate-400">{s.time}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {s.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {s.customerName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {s.customerPhone}
                        </td>
                        <td className="py-3 px-4 max-w-[280px]">
                          <div className="space-y-0.5">
                            {s.items.map((i, idx) => (
                              <div key={i.id || `item-${idx}`} className="text-[11px] text-slate-700">
                                <span className="font-bold">{i.quantity}x</span> {i.product}{" "}
                                {i.brandModel ? `(${i.brandModel})` : ""}{" "}
                                <span className="text-slate-400 font-mono">
                                  (₹{i.lineTotal.toFixed(2)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <PaymentMethodBadge method={s.paymentMethod} />
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900 font-mono text-sm">
                          ₹{s.grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. PBA Store REPORTS & EXPORT */}
        <div className="space-y-6 pt-2">
          {/* Controls & Export Buttons */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                PBA Store Reports for {employeeName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate and export detailed shop statements and product breakdowns.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={reportDateFilter}
                onChange={(e) => setReportDateFilter(e.target.value as SalesDateFilter)}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>

              {reportDateFilter === "custom" && (
                <div className="flex items-center gap-1 text-xs">
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Report Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Filtered Transactions
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {reportTotals.totalTransactions}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Products Sold
              </span>
              <p className="text-xl font-black text-indigo-700 mt-1">
                {reportTotals.totalProductsSold} units
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Grand Total Shop Revenue
              </span>
              <p className="text-xl font-black text-emerald-700 mt-1">
                ₹{reportTotals.grandTotalSales.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Product-wise Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-800 uppercase tracking-wider">
              Product-wise Breakdown
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
                  <tr>
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4 text-center">Quantity Sold</th>
                    <th className="py-2.5 px-4 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {reportTotals.productBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        No transactions found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    reportTotals.productBreakdown.map((p) => (
                      <tr key={p.product} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {p.product}
                        </td>
                        <td className="py-2.5 px-4 text-center font-semibold">
                          {p.qty}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          ₹{p.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* REMOVE PRODUCT CONFIRMATION DIALOG */}
      {pendingRemoveIndex !== null && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Remove Product
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Remove this product from the sale?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingRemoveIndex(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveItem}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE ADD PRODUCT NAME DIALOG — lightweight, just captures a product name */}
      {isAddNameModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Product to Catalog</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter a product name. It will be saved permanently and appear in the dropdown for all future sales.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="e.g. ELBOW SUPPORT"
              value={addProductNameInput}
              onChange={(e) => setAddProductNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmAddProductName();
                if (e.key === "Escape") { setIsAddNameModalOpen(false); setPendingAddProductIndex(null); }
              }}
              className="w-full px-3 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 mb-4 uppercase tracking-wide"
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setIsAddNameModalOpen(false); setPendingAddProductIndex(null); }}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddProductName}
                disabled={!addProductNameInput.trim()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add &amp; Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default EmployeeSalesModule;
