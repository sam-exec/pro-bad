"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Building2,
  Layers,
} from "lucide-react";
import { InventoryItem, StockStatus, INVENTORY_CATEGORIES } from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UniversalSearch } from "@/components/ui/universal-search";
import { ExportDropdown } from "@/components/admin/common/export-dropdown";
import { ExportColumn } from "@/utils/export-engine";
import { AddProductModal } from "@/components/inventory/add-product-modal";
import { InventoryDetailsDrawer } from "@/components/inventory/inventory-details-drawer";

const inventoryExportColumns: ExportColumn<InventoryItem>[] = [
  { header: "SKU", key: "sku" },
  { header: "Product Name", key: "productName" },
  { header: "Category", key: "category" },
  { header: "HSN/SAC", key: "hsnSac" },
  {
    header: "Purchase Price (₹)",
    key: "purchasePrice",
    formatter: (r) => `₹${r.purchasePrice.toFixed(2)}`,
  },
  {
    header: "Selling Price (₹)",
    key: "sellingPrice",
    formatter: (r) => `₹${r.sellingPrice.toFixed(2)}`,
  },
  { header: "Opening Stock", key: "openingStock" },
  { header: "Purchased (+)", key: "purchasedQuantity" },
  { header: "Sold (-)", key: "soldQuantity" },
  { header: "Current Stock", key: "currentStock" },
  { header: "Status", key: "status" },
  { header: "Supplier", key: "supplier", formatter: (r) => r.supplier || "—" },
];

export function AdminInventory() {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Drawer states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForDrawer, setSelectedItemForDrawer] = useState<InventoryItem | null>(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);

  // Subscribe to inventory changes
  useEffect(() => {
    const unsub = inventoryService.subscribe(() => {
      setUpdateTrigger((t) => t + 1);
    });
    return () => unsub();
  }, []);

  // Summary statistics
  const summary = useMemo(() => {
    return inventoryService.getInventorySummary();
  }, [updateTrigger]);

  // Filtered inventory list
  const filteredItems = useMemo(() => {
    return inventoryService.getInventory({
      category: categoryFilter === "all" ? undefined : categoryFilter,
      stockStatus: statusFilter === "All" ? undefined : statusFilter,
      searchQuery,
    });
  }, [categoryFilter, statusFilter, searchQuery, updateTrigger]);

  // Handlers
  const handleSaveProduct = (
    data: any,
    conflictMode?: "increase" | "separate"
  ) => {
    if (selectedItemForEdit) {
      inventoryService.updateProduct(selectedItemForEdit.id, data);
      setSelectedItemForEdit(null);
    } else {
      const mode = conflictMode === "separate" ? "create_new_sku" : "increase_existing";
      inventoryService.addProduct(
        {
          productName: data.productName || "Unnamed Item",
          category: data.category || "Accessories",
          hsnSac: data.hsnSac || "9506",
          supplier: data.supplier,
          purchasePrice: data.purchasePrice || 0,
          sellingPrice: data.sellingPrice || 0,
          openingStock: data.openingStock || 0,
          lowStockThreshold: data.lowStockThreshold || 5,
          notes: data.notes,
        },
        mode
      );
    }
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      inventoryService.deleteProduct(id);
      if (selectedItemForDrawer?.id === id) {
        setSelectedItemForDrawer(null);
      }
    }
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case "In Stock":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> In Stock
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Low Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3" /> Out of Stock
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Inventory Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Single source of truth for stock quantities, live retail valuations, and SKU tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportDropdown
            moduleName="Master_Inventory"
            moduleTitle="Master Inventory Catalog"
            subtitle="Facility Inventory Stock"
            columns={inventoryExportColumns}
            currentViewData={filteredItems}
            selectedData={[]}
            entireModuleData={inventoryService.getInventory()}
          />
          <Button
            onClick={() => {
              setSelectedItemForEdit(null);
              setIsAddModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>

      {/* 1. TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKUs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Catalog SKUs
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {summary.totalItems}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Distinct registered items
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Available Units
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1 block">
              {summary.totalQuantity}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Across on-hand inventory
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Total Inventory Valuation */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Stock Valuation (Retail)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              ₹{summary.totalRetailValue.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Cost: ₹{summary.totalCostValue.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Stock Alerts Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Stock Health
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-amber-600">
                {summary.lowStockItems} Low
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-lg font-bold text-rose-600">
                {summary.outOfStockItems} Out
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {summary.inStockItems} items healthy
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. FILTER CONTROLS BAR */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Universal Search */}
          <div className="flex-1 max-w-md">
            <UniversalSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search product name, SKU, HSN/SAC, supplier..."
              className="w-full"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {INVENTORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent border-none text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(categoryFilter !== "all" || statusFilter !== "All" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter("all");
                  setStatusFilter("All");
                  setSearchQuery("");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 h-8"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 3. INVENTORY DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Purchase (₹)</th>
                <th className="py-3 px-3 text-right">Selling (₹)</th>
                <th className="py-3 px-3 text-right">Margin</th>
                <th className="py-3 px-4 text-center">Stock Breakdown (Op + Pur - Sold)</th>
                <th className="py-3 px-3 text-right">Current Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No inventory items found matching the filters.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting the search query or add a new product.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const margin = item.sellingPrice - item.purchasePrice;
                  const marginPct =
                    item.purchasePrice > 0
                      ? ((margin / item.purchasePrice) * 100).toFixed(0)
                      : "0";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedItemForDrawer(item)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{item.sku}</span>
                          {item.hsnSac && (
                            <span className="text-slate-400">• HSN: {item.hsnSac}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700">
                        {item.category}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{item.purchasePrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        ₹{item.sellingPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="text-emerald-700 font-bold">
                          +₹{margin.toFixed(0)}
                        </span>{" "}
                        <span className="text-[10px] text-emerald-600">({marginPct}%)</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60 font-mono">
                          <span>{item.openingStock}</span>
                          <span className="text-emerald-600">+{item.purchasedQuantity}</span>
                          <span className="text-rose-500">-{item.soldQuantity}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="text-sm font-black text-slate-900">
                          {item.currentStock}
                        </span>{" "}
                        <span className="text-[10px] text-slate-400">units</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {getStatusBadge(item.status)}
                      </td>

                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="View Details"
                            onClick={() => setSelectedItemForDrawer(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit Product"
                            onClick={() => {
                              setSelectedItemForEdit(item);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Product"
                            onClick={() => handleDeleteItem(item.id, item.productName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer info */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing {filteredItems.length} products in inventory</span>
          <span>Stock formula: Current = Opening + Purchased - Sold</span>
        </div>
      </div>

      {/* Modals and Drawers */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedItemForEdit(null);
        }}
        onSave={handleSaveProduct}
        isAdmin={true}
        itemToEdit={selectedItemForEdit}
      />

      <InventoryDetailsDrawer
        item={selectedItemForDrawer}
        isOpen={!!selectedItemForDrawer}
        onClose={() => setSelectedItemForDrawer(null)}
        onEdit={(item) => {
          setSelectedItemForDrawer(null);
          setSelectedItemForEdit(item);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
}

export default AdminInventory;
