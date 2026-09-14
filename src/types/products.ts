export type ProductCategory =
  | "Grips"
  | "Equipment"
  | "Bags"
  | "Accessories"
  | "Training Equipment"
  | "Badminton Consumables"
  | "Merchandise";

export type VariantStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface VariantAttribute {
  name: string; // e.g., "Size", "Color", "Weight Category", "Grip Size", "Tube Quantity", "Brand"
  value: string; // e.g., "UK 9", "Neon Yellow", "4U", "G5", "12 Shuttles/Tube", "Yonex"
}

export interface ProductVariant {
  id: string; // e.g., "var-rqt-astrox99-4ug5"
  modelId: string; // e.g., "mod-rqt-astrox99"
  productId: string; // e.g., "prod-racquet"
  productName: string; // e.g., "RACQUET"
  category: ProductCategory; // e.g., "Equipment"
  modelName: string; // e.g., "Astrox 99 Pro"
  sku: string; // e.g., "RQT-AST99-4UG5-RED"
  attributes: Record<string, string>; // { "Weight": "4U", "Grip Size": "G5", "Color": "Cherry Sunburst" }
  costPrice: number; // e.g., 140
  sellingPrice: number; // e.g., 220
  stockQuantity: number; // Current branch stock
  lowStockThreshold: number; // e.g., 5
  status: VariantStatus;
  branchId: string; // Branch isolation support
  image?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductModel {
  id: string; // e.g., "mod-rqt-astrox99"
  productId: string; // e.g., "prod-racquet"
  name: string; // e.g., "Astrox 99 Pro"
  brand?: string; // e.g., "Yonex"
  description?: string;
  basePrice?: number;
  variants: ProductVariant[];
  supportedAttributeKeys: string[]; // e.g., ["Weight", "Grip Size", "Color"]
}

export interface ProductDefinition {
  id: string; // e.g., "prod-racquet"
  name: string; // e.g., "RACQUET"
  category: ProductCategory;
  description: string;
  iconName?: string;
  defaultAttributeKeys: string[]; // e.g., ["Model Name", "Weight Category", "Grip Size"]
  models: ProductModel[];
}

export interface CategoryDefinition {
  id: ProductCategory;
  name: ProductCategory;
  description: string;
  iconName: string;
  productNames: string[];
}

export interface CartItem {
  variantId: string;
  sku: string;
  category: ProductCategory;
  productName: string;
  modelName: string;
  attributes: Record<string, string>;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  maxStock: number;
}

import { PaymentMethod } from "./payment";

export interface POSSalePayload {
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxRate: number; // e.g., 0.18 for 18% GST
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  branchId: string;
  branchName: string;
  employeeId: string;
  employeeName: string;
}

export interface InvoiceDetails extends POSSalePayload {
  id: string;
  invoiceNumber: string;
  saleDate: string;
  status: "Paid" | "Refunded" | "Cancelled";
}
