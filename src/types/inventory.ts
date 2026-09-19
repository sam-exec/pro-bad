export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  hsnSac: string;
  supplier?: string;
  purchasePrice: number;
  sellingPrice: number;
  openingStock: number;
  purchasedQuantity: number;
  soldQuantity: number;
  currentStock: number;
  availableStock: number;
  lowStockThreshold: number;
  lastPurchaseDate?: string;
  status: StockStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseBillItem {
  id: string;
  productName: string;
  description?: string;
  hsnSac: string;
  taxRate: number; // e.g. 0, 5, 12, 18, 28
  quantity: number;
  unit: string; // e.g. "Pcs", "Nos", "Tubes", "Sets", "Boxes"
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  amount: number;
}

export interface PurchaseBill {
  id: string;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  supplierName: string;
  supplierAddress: string;
  gstNumber: string;
  panNumber: string;
  phoneNumber: string;
  placeOfSupply: string;
  notes?: string;
  items: PurchaseBillItem[];
  totalQuantity: number;
  taxableAmount: number;
  gstAmount: number;
  roundOff: number;
  grandTotal: number;
  status: "Completed" | "Pending" | "Verified";
  employeeId?: string;
  employeeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilterOptions {
  category?: string;
  supplier?: string;
  stockStatus?: StockStatus | "All" | "all";
  searchQuery?: string;
}

export interface PurchaseHistoryFilterOptions {
  supplier?: string;
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  searchQuery?: string;
}

export const INVENTORY_CATEGORIES = [
  "Racquets",
  "Shuttlecocks",
  "Grips",
  "Strings",
  "Kit Bags",
  "Shoes & Footwear",
  "Apparel & Jerseys",
  "Supports & Braces",
  "Accessories",
  "Court Equipment",
] as const;

export const PRODUCT_UNITS = [
  "Pcs",
  "Nos",
  "Tubes",
  "Sets",
  "Boxes",
  "Pairs",
  "Rolls",
] as const;

export const GST_TAX_RATES = [0, 5, 12, 18, 28] as const;
