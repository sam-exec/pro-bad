"use client";

import React, { useState, useEffect } from "react";
import {
  ProductCategory,
  ProductDefinition,
  ProductModel,
  ProductVariant,
} from "@/types/products";
import { productService } from "@/services/productService";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Tag,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVariantAdded?: (variant: ProductVariant) => void;
  initialProductId?: string;
}

export function VariantConfigModal({
  isOpen,
  onClose,
  onVariantAdded,
  initialProductId,
}: VariantConfigModalProps) {
  const categories = productService.getCategories();
  const allProducts = productService.getAllProducts();

  // Mode: "add-variant" or "add-model"
  const [activeTab, setActiveTab] = useState<"variant" | "model">("variant");

  // Selection states
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("Equipment");
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || "prod-racquet"
  );
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  // Variant Form state
  const [sku, setSku] = useState("");
  const [costPrice, setCostPrice] = useState<number>(100);
  const [sellingPrice, setSellingPrice] = useState<number>(160);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(3);
  const [attributeRows, setAttributeRows] = useState<
    { key: string; value: string }[]
  >([
    { key: "Weight Category", value: "4U" },
    { key: "Grip Size", value: "G5" },
  ]);

  // Model Form state
  const [newModelName, setNewModelName] = useState("");
  const [newModelBrand, setNewModelBrand] = useState("Yonex");
  const [newModelDescription, setNewModelDescription] = useState("");
  const [newModelBasePrice, setNewModelBasePrice] = useState<number>(150);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Filtered products & models
  const availableProducts = allProducts.filter(
    (p) => p.category === selectedCategory
  );
  const currentProduct =
    allProducts.find((p) => p.id === selectedProductId) ||
    availableProducts[0];
  const availableModels = currentProduct?.models || [];

  // Initialize defaults
  useEffect(() => {
    if (availableProducts.length > 0 && !availableProducts.some((p) => p.id === selectedProductId)) {
      setSelectedProductId(availableProducts[0].id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.some((m) => m.id === selectedModelId)) {
      setSelectedModelId(availableModels[0].id);
    }
  }, [selectedProductId, availableModels]);

  // Auto-fill default attribute templates based on product
  useEffect(() => {
    if (currentProduct) {
      const template = currentProduct.defaultAttributeKeys.map((k) => ({
        key: k,
        value: "",
      }));
      if (template.length > 0) {
        setAttributeRows(template);
      }
    }
  }, [selectedProductId]);

  // Auto-generate suggested SKU
  const generateSuggestedSKU = () => {
    if (!currentProduct) return;
    const catCode = selectedCategory.substring(0, 3).toUpperCase();
    const prodCode = currentProduct.name.substring(0, 3).toUpperCase();
    const attrValues = attributeRows
      .map((r) => r.value.trim().toUpperCase().replace(/\s+/g, ""))
      .filter(Boolean)
      .join("-");
    const rand = Math.floor(100 + Math.random() * 900);
    const suggested = `${catCode}-${prodCode}${attrValues ? `-${attrValues}` : ""}-${rand}`;
    setSku(suggested);
  };

  const handleAddAttributeRow = () => {
    setAttributeRows([...attributeRows, { key: "", value: "" }]);
  };

  const handleRemoveAttributeRow = (idx: number) => {
    setAttributeRows(attributeRows.filter((_, i) => i !== idx));
  };

  const handleAttributeChange = (
    idx: number,
    field: "key" | "value",
    val: string
  ) => {
    const next = [...attributeRows];
    next[idx][field] = val;
    setAttributeRows(next);
  };

  const handleVariantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentProduct) {
      setMessage({ type: "error", text: "Please select a product." });
      return;
    }
    const model = availableModels.find((m) => m.id === selectedModelId);
    if (!model) {
      setMessage({ type: "error", text: "Please select or create a model first." });
      return;
    }
    if (!sku.trim()) {
      setMessage({ type: "error", text: "Please enter a valid SKU." });
      return;
    }

    // Build attribute record
    const attrs: Record<string, string> = {};
    attributeRows.forEach((r) => {
      if (r.key.trim() && r.value.trim()) {
        attrs[r.key.trim()] = r.value.trim();
      }
    });

    try {
      const newVar = productService.addVariant({
        modelId: model.id,
        productId: currentProduct.id,
        productName: currentProduct.name,
        category: currentProduct.category,
        modelName: model.name,
        sku: sku.trim().toUpperCase(),
        attributes: attrs,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        stockQuantity: Number(stockQuantity) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 2,
      });

      setMessage({
        type: "success",
        text: `Variant ${newVar.sku} added successfully to ${model.name}!`,
      });
      if (onVariantAdded) onVariantAdded(newVar);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create variant" });
    }
  };

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentProduct) {
      setMessage({ type: "error", text: "Please select a product." });
      return;
    }
    if (!newModelName.trim()) {
      setMessage({ type: "error", text: "Please enter a model name." });
      return;
    }

    try {
      const model = productService.addModel(currentProduct.id, {
        name: newModelName.trim(),
        brand: newModelBrand.trim(),
        description: newModelDescription.trim(),
        basePrice: Number(newModelBasePrice) || 0,
      });

      setMessage({
        type: "success",
        text: `Model "${model.name}" created under ${currentProduct.name}! Now add variants below.`,
      });
      setSelectedModelId(model.id);
      setActiveTab("variant");
      setNewModelName("");
      setNewModelDescription("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create model" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dynamic Product & Variant Configurator
              </h2>
              <p className="text-xs text-slate-500">
                Configure models, custom attributes, SKUs, and variant-level pricing & stock.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setActiveTab("variant")}
            className={cn(
              "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeTab === "variant"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            Add Product Variant (SKU & Stock)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("model")}
            className={cn(
              "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeTab === "model"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            + Add New Model / Brand Line
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {message && (
            <div
              className={cn(
                "p-3 rounded-xl mb-4 text-xs flex items-center gap-2 border",
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              )}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === "variant" ? (
            <form onSubmit={handleVariantSubmit} className="space-y-4">
              {/* Category & Product */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as ProductCategory)
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Model / Brand *
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.brand || "ProBad"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Attribute Key-Value Builder */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Variant Attributes (e.g. Size, Color, Grip, Weight, Tube Qty)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAttributeRow}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Attribute</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {attributeRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Attribute Name (e.g. Size)"
                        value={row.key}
                        onChange={(e) =>
                          handleAttributeChange(idx, "key", e.target.value)
                        }
                        className="flex-1 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. UK 9 / Neon Yellow / 4U)"
                        value={row.value}
                        onChange={(e) =>
                          handleAttributeChange(idx, "value", e.target.value)
                        }
                        className="flex-1 text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                      />
                      {attributeRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttributeRow(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SKU & Auto-generate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Variant SKU *
                  </label>
                  <button
                    type="button"
                    onClick={generateSuggestedSKU}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generate SKU</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. RQT-AST100-4UG5"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                />
              </div>

              {/* Pricing & Stock Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Stock Qty *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) =>
                      setLowStockThreshold(parseInt(e.target.value, 10) || 2)
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-semibold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Variant</span>
                </button>
              </div>
            </form>
          ) : (
            /* Model creation form */
            <form onSubmit={handleModelSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value as ProductCategory)
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent Product *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  >
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Model / Series Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Astrox 88D Pro Gen-3"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Yonex / Victor / Li-Ning"
                    value={newModelBrand}
                    onChange={(e) => setNewModelBrand(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Base / Reference Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newModelBasePrice}
                    onChange={(e) =>
                      setNewModelBasePrice(parseFloat(e.target.value) || 0)
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Features
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Enhanced rotational generator system with head-heavy balance."
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Model</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
