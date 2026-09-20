"use client";

import React, { useState, useEffect } from "react";
import {
  CartItem,
  POSSalePayload,
  InvoiceDetails,
} from "@/types/products";
import { productService } from "@/services/productService";
import { ProductSelectionFlow } from "./pos/product-selection-flow";
import { POSCart } from "./pos/pos-cart";
import { InventoryTable } from "./admin/inventory-table";
import { ProductCatalogManager } from "./admin/product-catalog-manager";
import { VariantConfigModal } from "./admin/variant-config-modal";
import { InvoiceModal } from "./invoice-modal";
import {
  ShoppingCart,
  Layers,
  Package,
  Receipt,
  Plus,
  CircleDollarSign,
  Search,
  CheckCircle2,
  Printer,
  Calendar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesModuleProps {
  isAdmin?: boolean;
}

export function SalesModule({
  isAdmin = false,
}: SalesModuleProps) {
  const [activeTab, setActiveTab] = useState<
    "pos" | "inventory" | "catalog" | "invoices"
  >("pos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalInitialProdId, setModalInitialProdId] = useState<string | undefined>();
  const [activeInvoice, setActiveInvoice] = useState<InvoiceDetails | null>(null);
  const [, setRenderTrigger] = useState(0);

  // Subscribe to service updates
  useEffect(() => {
    const unsub = productService.subscribe(() => {
      setRenderTrigger((r) => r + 1);
    });
    return () => unsub();
  }, []);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.variantId === item.variantId);
      if (existingIdx > -1) {
        const next = [...prev];
        const updatedQty = Math.min(
          next[existingIdx].maxStock,
          next[existingIdx].quantity + item.quantity
        );
        next[existingIdx] = { ...next[existingIdx], quantity: updatedQty };
        return next;
      }
      return [...prev, item];
    });
  };

  const handleUpdateQuantity = (variantId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.min(item.maxStock, qty) }
          : item
      )
    );
  };

  const handleRemoveItem = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckout = async (payload: POSSalePayload) => {
    const invoice = await productService.processPOSSale(payload);
    setCart([]);
    setActiveInvoice(invoice);
  };

  const handleOpenAddModal = (productId?: string) => {
    setModalInitialProdId(productId);
    setIsAddModalOpen(true);
  };

  const invoices = productService.getInvoices();

  return (
    <div className="space-y-6">
      {/* Module Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sales, POS &amp; Product Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CircleDollarSign className="w-3.5 h-3.5" />
              <span>PBA Store</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Category hierarchy, dynamic variant configuration, variant-level stock tracking, and point-of-sale invoicing.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("pos")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              activeTab === "pos"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Point of Sale (POS)</span>
            {cart.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              activeTab === "catalog"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Product Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              activeTab === "inventory"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Stock &amp; Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              activeTab === "invoices"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Invoices ({invoices.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: POINT OF SALE (POS) */}
      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7.5 Columns: Category & Product Selection Flow */}
          <div className="lg:col-span-8">
            <ProductSelectionFlow
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Right 4.5 Columns: Interactive POS Cart */}
          <div className="lg:col-span-4 sticky top-4">
            <POSCart
              cart={cart}
              employeeId="NLG004"
              employeeName="Rahul Sharma"
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT & MODEL CATALOG */}
      {activeTab === "catalog" && (
        <ProductCatalogManager onOpenAddModal={handleOpenAddModal} />
      )}

      {/* TAB 3: STOCK & INVENTORY MATRIX */}
      {activeTab === "inventory" && (
        <InventoryTable
          onOpenAddModal={() => handleOpenAddModal()}
        />
      )}

      {/* TAB 4: INVOICES & TRANSACTIONS */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Sales Invoices &amp; Transaction Receipts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full history of retail and pro-shop invoices logged to system.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {invoices.length} Invoices Recorded
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-600">
                          No sales invoices generated yet.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Complete your first sale in the Point of Sale tab!
                        </p>
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{inv.customerName}</div>
                          <div className="text-[11px] text-slate-500">{inv.customerMobile}</div>
                        </td>
                        <td className="py-3 px-4 max-w-[280px] truncate">
                          {inv.items
                            .map((i) => `${i.quantity}x ${i.productName} (${i.modelName})`)
                            .join(", ")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {inv.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                          ₹{inv.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveInvoice(inv)}
                            className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Model / Variant Config Modal */}
      <VariantConfigModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialProductId={modalInitialProdId}
      />

      {/* Printable Invoice Modal */}
      <InvoiceModal
        invoice={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />
    </div>
  );
}
export default SalesModule;
