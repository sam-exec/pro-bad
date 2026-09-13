"use client";

import React, { useState, useMemo } from "react";
import {
  ProductCategory,
  ProductVariant,
  VariantStatus,
} from "@/types/products";
import { productService } from "@/services/productService";
import { BRANCHES } from "@/config/branches";
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Minus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Package,
  TrendingUp,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  selectedBranch: string;
  onOpenAddModal: () => void;
}

export function InventoryTable({
  selectedBranch,
  onOpenAddModal,
}: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<VariantStatus | "All">("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Quick edit modal state
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCost, setEditCost] = useState<number>(0);

  const categories = productService.getCategories();

  // Fetch variants with filter
  const variants = useMemo(() => {
    return productService.getVariants({
      branchId: selectedBranch === "all" ? undefined : selectedBranch,
      category: categoryFilter,
      status: statusFilter,
      lowStockOnly,
      search: searchQuery,
    });
  }, [selectedBranch, categoryFilter, statusFilter, lowStockOnly, searchQuery]);

  // Inventory KPI statistics
  const stats = useMemo(() => {
    return productService.getInventoryStats(
      selectedBranch === "all" ? undefined : selectedBranch
    );
  }, [selectedBranch, variants]);

  const handleQuickStockChange = (variantId: string, diff: number) => {
    try {
      productService.adjustStock(variantId, diff);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (v: ProductVariant) => {
    setEditingVariant(v);
    setEditStock(v.stockQuantity);
    setEditPrice(v.sellingPrice);
    setEditCost(v.costPrice);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;

    try {
      productService.updateVariant(editingVariant.id, {
        stockQuantity: Number(editStock) || 0,
        sellingPrice: Number(editPrice) || 0,
        costPrice: Number(editCost) || 0,
      });
      setEditingVariant(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string, sku: string) => {
    if (confirm(`Are you sure you want to remove variant with SKU: ${sku}?`)) {
      productService.deleteVariant(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total SKUs
            </span>
            <Package className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{stats.totalVariants}</p>
          <span className="text-[11px] text-slate-400 font-medium">
            {stats.totalUnits} units on hand
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Retail Valuation
            </span>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600">
            ₹{stats.totalValuation.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            Cost: ₹{stats.totalCostValuation.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Projected Margin
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-indigo-600">
            {stats.projectedMargin}%
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            Avg product markup
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600">{stats.lowStockCount}</p>
          <span className="text-[11px] text-amber-600/80 font-medium">
            Requires restock
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Out of Stock
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-600">
            {stats.outOfStockCount}
          </p>
          <span className="text-[11px] text-rose-600/80 font-medium">
            Unavailable
          </span>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by SKU, Model, Product, or Attributes (e.g. 4U, UK 9, Black)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Model / Variant</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Category:
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter("All")}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer",
              categoryFilter === "All"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
          >
            All ({productService.getVariants({ branchId: selectedBranch === "all" ? undefined : selectedBranch }).length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer",
                categoryFilter === c.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              {c.name}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Low stock toggle */}
          <button
            type="button"
            onClick={() => setLowStockOnly((prev) => !prev)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5",
              lowStockOnly
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Low Stock Filter</span>
          </button>
        </div>
      </div>

      {/* Variant Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4">Category / Product</th>
                <th className="py-3 px-4">Variant Attributes</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Margin</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {variants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                      No matching product variants found.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try clearing filters or click &quot;Add Model / Variant&quot; above.
                    </p>
                  </td>
                </tr>
              ) : (
                variants.map((v) => {
                  const marginDollars = v.sellingPrice - v.costPrice;
                  const marginPercent =
                    v.sellingPrice > 0
                      ? Math.round((marginDollars / v.sellingPrice) * 100)
                      : 0;

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* SKU & Model */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          {v.sku}
                        </span>
                        <span className="text-[11px] text-slate-600 font-semibold truncate max-w-[200px] block mt-0.5">
                          {v.modelName}
                        </span>
                      </td>

                      {/* Category & Product */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block text-xs">
                          {v.productName}
                        </span>
                        <span className="inline-block text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium mt-0.5">
                          {v.category}
                        </span>
                      </td>

                      {/* Attributes */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {Object.entries(v.attributes).map(([k, val]) => (
                            <span
                              key={k}
                              className="text-[10px] px-1.5 py-0.5 bg-indigo-50/80 text-indigo-700 rounded border border-indigo-100/60 font-semibold"
                            >
                              {k}: {val}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        ₹{v.costPrice.toFixed(2)}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{v.sellingPrice.toFixed(2)}
                      </td>

                      {/* Margin */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-emerald-700 font-bold block text-xs">
                          +₹{marginDollars.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({marginPercent}%)
                        </span>
                      </td>

                      {/* Stock with quick adjust buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            disabled={v.stockQuantity <= 0}
                            onClick={() => handleQuickStockChange(v.id, -1)}
                            className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 text-xs disabled:opacity-30 cursor-pointer"
                            title="Decrease 1 unit"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-extrabold text-slate-900">
                            {v.stockQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickStockChange(v.id, 1)}
                            className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 text-xs cursor-pointer"
                            title="Add 1 unit"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                            v.status === "In Stock"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : v.status === "Low Stock"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {v.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(v)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Stock & Price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v.id, v.sku)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Stock & Price Modal */}
      {editingVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Edit Variant: <span className="font-mono text-indigo-600">{editingVariant.sku}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingVariant.productName} • {editingVariant.modelName}
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editStock}
                  onChange={(e) => setEditStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCost}
                    onChange={(e) => setEditCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
