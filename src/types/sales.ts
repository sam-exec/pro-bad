export const SALES_PRODUCT_LIST = [
  "SUPER OVER GRIP",
  "SUPER GRIP",
  "GP-18",
  "SHOES",
  "RACQUET",
  "KIT BAG",
  "INSOLES",
  "SOCKS",
  "SOCKS JN",
  "KINESIOLOGY TAPE",
  "KNEE SUPPORT",
  "WRISTBAND",
  "WATER BOTTLE",
  "HEAD BAND",
  "CAPS",
  "TOWELS",
  "JUMP ROPE",
  "YOGA MAT",
  "BACK PACK",
  "SHOE BAG",
  "ANKLE SUPPORT",
  "STRINGS",
  "SHUTTLE COCKS",
  "T-SHIRTS",
  "SHORTS",
  "MEN'S SLEEVELESS TOP",
  "UNISEX WARM UP JACKET",
  "FEATHER SHUTTLES",
] as const;

export type SalesProduct = typeof SALES_PRODUCT_LIST[number];

import { PaymentMethod } from "./payment";

export type SalesPaymentMethod = PaymentMethod;

export interface SaleLineItem {
  id: string;
  product: SalesProduct | string;
  brandModel: string;
  sizeVariant: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SaleTransaction {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: SaleLineItem[];
  grandTotal: number;
  paymentMethod: PaymentMethod;
  employeeId: string;
  employeeName: string;
  branchId: string;
  branchName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  createdAt: string; // ISO
}

export type SalesDateFilter = "today" | "week" | "month" | "custom" | "all";

export interface SalesFilterOptions {
  branchId?: string;
  employeeId?: string;
  product?: string;
  dateFilter?: SalesDateFilter;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  paymentMethod?: PaymentMethod | "all";
}

export interface EmployeeTodayStats {
  todayTransactions: number;
  todayProductsSold: number;
  todaySalesAmount: number;
}

export interface AdminSalesSummary {
  totalTransactions: number;
  totalProductsSold: number;
  totalSalesAmount: number;
  employeeSummary: {
    employeeId: string;
    employeeName: string;
    branchName: string;
    transactionCount: number;
    productsSold: number;
    totalAmount: number;
  }[];
  branchSummary: {
    branchId: string;
    branchName: string;
    transactionCount: number;
    productsSold: number;
    totalAmount: number;
  }[];
}
