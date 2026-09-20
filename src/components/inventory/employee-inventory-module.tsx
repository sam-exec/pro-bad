"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  Plus,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Building2,
  Layers,
} from "lucide-react";
import { InventoryItem, StockStatus, INVENTORY_CATEGORIES } from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
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

export function EmployeeInventoryModule() {
  const { employeeId } = useAuth();
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForDrawer, setSelectedItemForDrawer] = useState<InventoryItem | null>(null);

  // Subscribe to inventory changes
  useEffect(() => {
    const unsub = inventoryService.subscribe(() => {
      setUpdateTrigger((t) => t + 1);
    });
    return () => unsub();
  }, []);

  // Summary
  const summary = useMemo(() => {
    return inventoryService.getInventorySummary();
  }, [updateTrigger]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return inventoryService.getInventory({
      category: categoryFilter,
      stockStatus: statusFilter,
      searchQuery,
    });
  }, [categoryFilter, statusFilter, searchQuery, updateTrigger]);

  const handleSaveProduct = (
    data: any,
    conflictMode?: "increase" | "separate"
  ) => {
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
              Facility Inventory
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Package className="w-3.5 h-3.5" />
              <span>{summary.totalItems} Items</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock availability, catalog SKUs, and retail prices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportDropdown
            moduleName="Facility_Inventory"
            moduleTitle="Inventory Catalog"
            subtitle="Facility Registry"
            columns={inventoryExportColumns}
            currentViewData={filteredItems}
            selectedData={[]}
            entireModuleData={inventoryService.getInventory()}
          />
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Product
          </Button>
        </div>
      </div>



      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <UniversalSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search product name, SKU, HSN/SAC..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-3 text-right">Available Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No products found in facility inventory.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedItemForDrawer(item)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {item.sku} {item.hsnSac ? `• HSN: ${item.hsnSac}` : ""}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="text-sm font-black text-slate-900">{item.currentStock}</span>{" "}
                      <span className="text-[10px] text-slate-400">units</span>
                    </td>

                    <td className="py-3 px-3 text-center">{getStatusBadge(item.status)}</td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="View Details"
                        onClick={() => setSelectedItemForDrawer(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>
            Showing {filteredItems.length} products in facility catalog
          </span>
          <span>Live stock deducted on PBA Store billing</span>
        </div>
      </div>

      {/* Modals & Drawers */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveProduct}
        isAdmin={false}
      />

      <InventoryDetailsDrawer
        item={selectedItemForDrawer}
        isOpen={!!selectedItemForDrawer}
        onClose={() => setSelectedItemForDrawer(null)}
        onEdit={() => {}}
      />
    </div>
  );
}

export default EmployeeInventoryModule;
