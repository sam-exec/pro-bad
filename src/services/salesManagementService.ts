import {
  SaleTransaction,
  SaleLineItem,
  SalesFilterOptions,
  EmployeeTodayStats,
  AdminSalesSummary,
  SalesProduct,
} from "@/types/sales";
import { inventoryService } from "./inventoryService";

const STORAGE_KEY = "pro_badminton_sales_transactions_v2";

const INITIAL_SALES: SaleTransaction[] = [
  {
    id: "sale-tx-001",
    invoiceNumber: "INV-NLG-20260913-001",
    customerName: "Sanjay Verma",
    customerPhone: "9876501234",
    items: [
      {
        id: "item-1",
        product: "RACQUET",
        brandModel: "Yonex Astrox 100ZZ",
        sizeVariant: "4U G5",
        quantity: 1,
        unitPrice: 220,
        lineTotal: 220,
      },
      {
        id: "item-2",
        product: "SUPER OVER GRIP",
        brandModel: "AC102EX",
        sizeVariant: "Pack of 3 - Neon Yellow",
        quantity: 2,
        unitPrice: 8.5,
        lineTotal: 17,
      },
      {
        id: "item-3",
        product: "STRINGS",
        brandModel: "Yonex BG65",
        sizeVariant: "0.70mm White",
        quantity: 1,
        unitPrice: 12,
        lineTotal: 12,
      },
    ],
    grandTotal: 249,
    paymentMethod: "UPI",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    date: "2026-09-13",
    time: "10:30:00",
    createdAt: "2026-09-13T10:30:00Z",
  },
  {
    id: "sale-tx-002",
    invoiceNumber: "INV-20260913-002",
    customerName: "Kavita Nair",
    customerPhone: "9876502345",
    items: [
      {
        id: "item-4",
        product: "SHOES",
        brandModel: "Power Cushion 65Z3",
        sizeVariant: "UK 8 - White/Blue",
        quantity: 1,
        unitPrice: 145,
        lineTotal: 145,
      },
      {
        id: "item-5",
        product: "SOCKS",
        brandModel: "3D Ergonomic",
        sizeVariant: "L (UK 8-11)",
        quantity: 2,
        unitPrice: 7,
        lineTotal: 14,
      },
    ],
    grandTotal: 159,
    paymentMethod: "Cash",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    date: "2026-09-13",
    time: "12:15:00",
    createdAt: "2026-09-13T12:15:00Z",
  },
  {
    id: "sale-tx-003",
    invoiceNumber: "INV-20260912-003",
    customerName: "Aditya Roy",
    customerPhone: "9876503456",
    items: [
      {
        id: "item-6",
        product: "RACQUET",
        brandModel: "Li-Ning Axforce 80",
        sizeVariant: "4U G5",
        quantity: 1,
        unitPrice: 195,
        lineTotal: 195,
      },
      {
        id: "item-7",
        product: "SHUTTLE COCKS",
        brandModel: "Victor Master No.1",
        sizeVariant: "Speed 77 - Tube of 12",
        quantity: 3,
        unitPrice: 28,
        lineTotal: 84,
      },
    ],
    grandTotal: 279,
    paymentMethod: "UPI",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    date: "2026-09-12",
    time: "16:40:00",
    createdAt: "2026-09-12T16:40:00Z",
  },
  {
    id: "sale-tx-004",
    invoiceNumber: "INV-20260911-004",
    customerName: "Pooja Hegde",
    customerPhone: "9876504567",
    items: [
      {
        id: "item-8",
        product: "TOWELS",
        brandModel: "Microfiber Sport",
        sizeVariant: "Navy Blue",
        quantity: 2,
        unitPrice: 15,
        lineTotal: 30,
      },
      {
        id: "item-9",
        product: "WATER BOTTLE",
        brandModel: "Stainless Steel 750ml",
        sizeVariant: "Matte Black",
        quantity: 1,
        unitPrice: 22,
        lineTotal: 22,
      },
    ],
    grandTotal: 52,
    paymentMethod: "Cash",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    date: "2026-09-11",
    time: "18:20:00",
    createdAt: "2026-09-11T18:20:00Z",
  },
  {
    id: "sale-tx-005",
    invoiceNumber: "INV-20260910-005",
    customerName: "Rohan Kulkarni",
    customerPhone: "9876505678",
    items: [
      {
        id: "item-10",
        product: "KIT BAG",
        brandModel: "Pro 9-Racquet Thermo",
        sizeVariant: "Red/Black",
        quantity: 1,
        unitPrice: 85,
        lineTotal: 85,
      },
      {
        id: "item-11",
        product: "GP-18",
        brandModel: "Victor Overgrip",
        sizeVariant: "Black",
        quantity: 3,
        unitPrice: 4.5,
        lineTotal: 13.5,
      },
    ],
    grandTotal: 98.5,
    paymentMethod: "UPI",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    date: "2026-09-10",
    time: "14:10:00",
    createdAt: "2026-09-10T14:10:00Z",
  },
];

class SalesManagementService {
  private sales: SaleTransaction[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.sales = JSON.parse(stored);
          return;
        }
      } catch {
        // Fall back to initial dataset
      }
    }
    this.sales = [...INITIAL_SALES];
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sales));
      } catch {
        // Silently ignore storage quota or private browsing errors
      }
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sales-data-updated"));
    }
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // Ignore subscriber errors
      }
    });
  }

  private getTodayDateString(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Save a new Sale Transaction
   */
  public createSale(payload: {
    customerName: string;
    customerPhone: string;
    items: Omit<SaleLineItem, "id" | "lineTotal">[];
    paymentMethod: "Cash" | "UPI";
    employeeId: string;
    employeeName: string;
  }): SaleTransaction {
    // 1. Stock validation - never allow inventory below zero
    for (const item of payload.items) {
      const needed = Number(item.quantity) || 1;
      const stock = inventoryService.checkStock(item.product, needed);
      if (!stock.available) {
        throw new Error(
          `Insufficient stock for "${item.product}"! Available: ${stock.currentStock}, Requested: ${needed}.`
        );
      }
    }

    const now = new Date();
    const dateStr = this.getTodayDateString();
    const timeStr = now.toTimeString().split(" ")[0]; // HH:mm:ss
    const timestamp = now.toISOString();

    const count = this.sales.length + 1;
    const invoiceNumber = `INV-${dateStr.replace(/-/g, "")}-${String(count).padStart(3, "0")}`;
    const id = `sale-${crypto.randomUUID()}`;

    const processedItems: SaleLineItem[] = payload.items.map((item) => ({
      ...item,
      id: `item-${crypto.randomUUID()}`,
      lineTotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
    }));

    const grandTotal = processedItems.reduce((sum, item) => sum + item.lineTotal, 0);

    const newSale: SaleTransaction = {
      id,
      invoiceNumber,
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      items: processedItems,
      grandTotal: Math.round(grandTotal * 100) / 100,
      paymentMethod: payload.paymentMethod,
      employeeId: payload.employeeId,
      employeeName: payload.employeeName,
      date: dateStr,
      time: timeStr,
      createdAt: timestamp,
    };

    this.sales.unshift(newSale);
    this.saveToStorage();

    // 2. Automatically deduct stock in Inventory
    for (const item of processedItems) {
      inventoryService.recordSale(item.product, item.quantity);
    }

    this.notify();
    return newSale;
  }

  /**
   * Fetch Sales for specific Employee with filters
   */
  public getSalesByEmployee(
    employeeId: string,
    options?: SalesFilterOptions
  ): SaleTransaction[] {
    let result = this.sales.filter((s) => s.employeeId === employeeId);

    if (options) {
      result = this.applyFilters(result, options);
    }

    return result;
  }

  /**
   * Fetch All Sales (for Admin) with filters
   */
  public getAllSales(options?: SalesFilterOptions): SaleTransaction[] {
    return this.applyFilters(this.sales, options || {});
  }

  private applyFilters(
    records: SaleTransaction[],
    options: SalesFilterOptions
  ): SaleTransaction[] {
    let result = [...records];

    if (options.employeeId && options.employeeId !== "all") {
      result = result.filter((s) => s.employeeId === options.employeeId);
    }

    if (options.product && options.product !== "all") {
      result = result.filter((s) =>
        s.items.some((item) => item.product === options.product)
      );
    }

    if (options.paymentMethod && options.paymentMethod !== "all") {
      result = result.filter((s) => s.paymentMethod === options.paymentMethod);
    }

    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.customerName.toLowerCase().includes(q) ||
          s.customerPhone.includes(q) ||
          s.invoiceNumber.toLowerCase().includes(q) ||
          s.items.some(
            (i) =>
              i.product.toLowerCase().includes(q) ||
              i.brandModel.toLowerCase().includes(q) ||
              i.sizeVariant.toLowerCase().includes(q)
          )
      );
    }

    // Date filtering
    if (options.dateFilter && options.dateFilter !== "all") {
      const todayStr = this.getTodayDateString();
      const today = new Date(todayStr);

      if (options.dateFilter === "today") {
        result = result.filter((s) => s.date === todayStr);
      } else if (options.dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split("T")[0];
        result = result.filter((s) => s.date >= weekAgoStr && s.date <= todayStr);
      } else if (options.dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthAgoStr = monthAgo.toISOString().split("T")[0];
        result = result.filter((s) => s.date >= monthAgoStr && s.date <= todayStr);
      } else if (options.dateFilter === "custom") {
        if (options.startDate) {
          result = result.filter((s) => s.date >= options.startDate!);
        }
        if (options.endDate) {
          result = result.filter((s) => s.date <= options.endDate!);
        }
      }
    }

    return result;
  }

  /**
   * Summary stats for currently logged in employee
   */
  public getEmployeeTodayStats(employeeId: string): EmployeeTodayStats {
    const todayStr = this.getTodayDateString();
    const todaySales = this.sales.filter(
      (s) => s.employeeId === employeeId && s.date === todayStr
    );

    const todayTransactions = todaySales.length;
    const todayProductsSold = todaySales.reduce(
      (sum, s) => sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
    const todaySalesAmount = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);

    return {
      todayTransactions,
      todayProductsSold,
      todaySalesAmount: Math.round(todaySalesAmount * 100) / 100,
    };
  }

  /**
   * Admin dashboard top stats
   */
  public getAdminSummary(): AdminSalesSummary {
    const list = this.sales;

    const totalTransactions = list.length;
    const totalProductsSold = list.reduce(
      (sum, s) => sum + s.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
    const totalSalesAmount = list.reduce((sum, s) => sum + s.grandTotal, 0);

    // Employee-wise aggregation
    const empMap = new Map<
      string,
      {
        employeeId: string;
        employeeName: string;
        transactionCount: number;
        productsSold: number;
        totalAmount: number;
      }
    >();

    list.forEach((s) => {
      const existing = empMap.get(s.employeeId) || {
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        transactionCount: 0,
        productsSold: 0,
        totalAmount: 0,
      };
      existing.transactionCount += 1;
      existing.productsSold += s.items.reduce((sum, i) => sum + i.quantity, 0);
      existing.totalAmount += s.grandTotal;
      empMap.set(s.employeeId, existing);
    });

    return {
      totalTransactions,
      totalProductsSold,
      totalSalesAmount: Math.round(totalSalesAmount * 100) / 100,
      employeeSummary: Array.from(empMap.values()),
    };
  }

  /**
   * Export to CSV/Excel file in browser
   */
  public exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
          )
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Trigger clean printable PDF view
   */
  public exportToPDF(title: string, subtitle: string, htmlContent: string) {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Please allow popups to generate PDF report.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
            .subtitle { font-size: 12px; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
            th { background-color: #f1f5f9; padding: 8px 10px; text-align: left; font-weight: 600; border-bottom: 2px solid #cbd5e1; color: #334155; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .total-row { font-weight: bold; background-color: #e2e8f0 !important; }
            .text-right { text-align: right; }
            .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="subtitle">${subtitle} • Generated: ${new Date().toLocaleString()}</div>
          ${htmlContent}
          <div class="footer">Pro Badminton Academy — Confidential Sales Report</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}

export const salesManagementService = new SalesManagementService();
export default salesManagementService;
