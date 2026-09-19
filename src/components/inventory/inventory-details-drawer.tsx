"use client";

import React from "react";
import {
  X,
  Package,
  Edit2,
  TrendingUp,
  AlertCircle,
  Building2,
  Tag,
  Hash,
  Truck,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import { InventoryItem } from "@/types/inventory";
import { Button } from "@/components/ui/button";

interface InventoryDetailsDrawerProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
}

export function InventoryDetailsDrawer({
  item,
  isOpen,
  onClose,
  onEdit,
}: InventoryDetailsDrawerProps) {
  if (!isOpen || !item) return null;

  const marginAmount = item.sellingPrice - item.purchasePrice;
  const marginPercent =
    item.purchasePrice > 0 ? ((marginAmount / item.purchasePrice) * 100).toFixed(1) : "0.0";
  const costValuation = item.currentStock * item.purchasePrice;
  const retailValuation = item.currentStock * item.sellingPrice;

  const getStatusBadge = () => {
    switch (item.status) {
      case "In Stock":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> In Stock
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Low Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" /> Out of Stock
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{item.productName}</h2>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                SKU: {item.sku} • {item.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
              className="text-slate-700 hover:text-emerald-700 hover:border-emerald-300"
            >
              <Edit2 className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stock Formula Breakdown Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              Real-time Stock Equation
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Opening
                </span>
                <span className="text-lg font-extrabold text-slate-800 mt-1 block">
                  {item.openingStock}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                  Purchased (+)
                </span>
                <span className="text-lg font-extrabold text-emerald-700 mt-1 block">
                  +{item.purchasedQuantity}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-rose-500 block">
                  Sold (-)
                </span>
                <span className="text-lg font-extrabold text-rose-600 mt-1 block">
                  -{item.soldQuantity}
                </span>
              </div>
              <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-100 block">
                  Current Stock
                </span>
                <span className="text-lg font-black mt-1 block">{item.currentStock}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 flex justify-between items-center px-1">
              <span>Low stock threshold: <strong>{item.lowStockThreshold} units</strong></span>
              <span>Available for billing: <strong className="text-emerald-700">{item.availableStock} units</strong></span>
            </div>
          </div>

          {/* Pricing & Margins Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              Pricing & Unit Economics
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 block">Purchase Cost</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  ₹{item.purchasePrice.toFixed(2)}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 block">Retail MRP</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  ₹{item.sellingPrice.toFixed(2)}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="text-[11px] font-medium text-emerald-800 block">Profit Margin</span>
                <span className="text-base font-bold text-emerald-700 mt-0.5 block flex items-center gap-1">
                  ₹{marginAmount.toFixed(2)}
                  <span className="text-xs font-semibold text-emerald-600">
                    ({marginPercent}%)
                  </span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Total Asset Value (Cost):</span>
                <span className="font-bold text-slate-800 text-sm">
                  ₹{costValuation.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Potential Realization (Retail):</span>
                <span className="font-bold text-emerald-700 text-sm">
                  ₹{retailValuation.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Catalog Metadata */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Item Details & Classification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-slate-400 block">HSN / SAC Code</span>
                <span className="font-mono font-medium text-slate-800">{item.hsnSac || "—"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Primary Supplier</span>
                <span className="font-medium text-slate-800">{item.supplier || "—"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Last Restocked</span>
                <span className="font-medium text-slate-800">
                  {item.lastPurchaseDate || "Initial Opening Stock"}
                </span>
              </div>
            </div>

            {item.notes && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-slate-400 block mb-1">Specifications / Notes</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg italic">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => onEdit(item)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Edit2 className="w-4 h-4 mr-1.5" />
            Edit Product
          </Button>
        </div>
      </div>
    </div>
  );
}
