"use client";

import React, { useState, useEffect } from "react";
import { X, Package, AlertCircle, Sparkles, Check, Layers } from "lucide-react";
import {
  InventoryItem,
  INVENTORY_CATEGORIES,
} from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<InventoryItem>, conflictMode?: "increase" | "separate") => void;
  isAdmin?: boolean;
  itemToEdit?: InventoryItem | null;
}

export function AddProductModal({
  isOpen,
  onClose,
  onSave,
  isAdmin = false,
  itemToEdit,
}: AddProductModalProps) {
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<string>(INVENTORY_CATEGORIES[0]);
  const [hsnSac, setHsnSac] = useState("");
  const [supplier, setSupplier] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number | string>("");
  const [sellingPrice, setSellingPrice] = useState<number | string>("");
  const [openingStock, setOpeningStock] = useState<number | string>("10");
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>("5");
  const [notes, setNotes] = useState("");

  // Conflict modal / banner state
  const [showDuplicatePrompt, setShowDuplicatePrompt] = useState(false);
  const [existingDuplicateItem, setExistingDuplicateItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setProductName(itemToEdit.productName);
      setSku(itemToEdit.sku);
      setCategory(itemToEdit.category);
      setHsnSac(itemToEdit.hsnSac);
      setSupplier(itemToEdit.supplier || "");
      setPurchasePrice(itemToEdit.purchasePrice);
      setSellingPrice(itemToEdit.sellingPrice);
      setOpeningStock(itemToEdit.currentStock);
      setLowStockThreshold(itemToEdit.lowStockThreshold);
      setNotes(itemToEdit.notes || "");
      setShowDuplicatePrompt(false);
    } else {
      setProductName("");
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
      setCategory(INVENTORY_CATEGORIES[0]);
      setHsnSac("9506");
      setSupplier("");
      setPurchasePrice("");
      setSellingPrice("");
      setOpeningStock("10");
      setLowStockThreshold("5");
      setNotes("");
      setShowDuplicatePrompt(false);
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert("Product name is required.");
      return;
    }

    // Check duplicate if creating new item
    if (!itemToEdit) {
      const existing = inventoryService.findDuplicateProduct(productName.trim());
      if (existing) {
        setExistingDuplicateItem(existing);
        setShowDuplicatePrompt(true);
        return;
      }
    }

    proceedSave();
  };

  const proceedSave = (conflictMode?: "increase" | "separate") => {
    const pPrice = parseFloat(purchasePrice.toString()) || 0;
    const sPrice = parseFloat(sellingPrice.toString()) || 0;
    const qty = parseInt(openingStock.toString(), 10) || 0;
    const threshold = parseInt(lowStockThreshold.toString(), 10) || 5;

    onSave(
      {
        productName: productName.trim(),
        sku: conflictMode === "separate" ? `${sku.trim()}-B` : sku.trim(),
        category,
        hsnSac: hsnSac.trim() || "9506",
        supplier: supplier.trim() || undefined,
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        openingStock: qty,
        currentStock: qty,
        availableStock: qty,
        lowStockThreshold: threshold,
        notes: notes.trim() || undefined,
      },
      conflictMode
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {itemToEdit ? "Edit Product" : "Add New Product to Inventory"}
              </h2>
              <p className="text-xs text-slate-500">
                {itemToEdit
                  ? `Update catalog details for SKU: ${itemToEdit.sku}`
                  : "Register merchandise or equipment into the facility inventory"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Resolution Banner if detected */}
        {showDuplicatePrompt && existingDuplicateItem && (
          <div className="p-5 bg-amber-50 border-b border-amber-200 text-amber-900 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-bold">
                  Existing Product Detected
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  A product named &ldquo;<strong>{existingDuplicateItem.productName}</strong>&rdquo; (SKU:{" "}
                  <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">
                    {existingDuplicateItem.sku}
                  </code>
                  ) currently exists in the inventory with a
                  current stock of <strong>{existingDuplicateItem.currentStock} units</strong>.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
                    onClick={() => proceedSave("increase")}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Increase Existing Stock (+{openingStock} units)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs h-8"
                    onClick={() => proceedSave("separate")}
                  >
                    <Layers className="w-3.5 h-3.5 mr-1" />
                    Create Separate SKU ({sku}-B)
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:bg-amber-100 text-xs h-8"
                    onClick={() => setShowDuplicatePrompt(false)}
                  >
                    Cancel / Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Primary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Product Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  placeholder="e.g. Yonex Astrox 99 Pro"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {INVENTORY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-700">
                    SKU / Barcode
                  </Label>
                  <button
                    type="button"
                    onClick={() => setSku(`SKU-${Date.now().toString().slice(-6)}`)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-gen
                  </button>
                </div>
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. YON-AX99-BLK"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Pricing & Stock Grid */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pricing & Stock Quantities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Purchase Rate (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">
                    {itemToEdit ? "Current Stock" : "Opening Stock"}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={openingStock}
                    onChange={(e) => setOpeningStock(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Low Stock Alert</Label>
                  <Input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tax & Supplier Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">HSN / SAC Code</Label>
                <Input
                  value={hsnSac}
                  onChange={(e) => setHsnSac(e.target.value)}
                  placeholder="e.g. 9506"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Supplier Name</Label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Sunrise Sports India"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Notes / Warranty Specs</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 4UG5, Full carbon graphite, includes full racket cover"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {itemToEdit ? "Save Changes" : "Add to Inventory"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
