"use client";

import React, { useState, useMemo } from "react";
import {
  ProductCategory,
  ProductDefinition,
  ProductModel,
  ProductVariant,
  CartItem,
} from "@/types/products";
import { productService } from "@/services/productService";
import {
  Flame,
  HandMetal,
  Briefcase,
  ShieldCheck,
  Activity,
  Sparkles,
  Shirt,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Package,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSelectionFlowProps {
  selectedBranch: string;
  onAddToCart: (item: CartItem) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Grips: HandMetal,
  Equipment: Flame,
  Bags: Briefcase,
  Accessories: ShieldCheck,
  "Training Equipment": Activity,
  "Badminton Consumables": Sparkles,
  Merchandise: Shirt,
};

export function ProductSelectionFlow({
  selectedBranch,
  onAddToCart,
}: ProductSelectionFlowProps) {
  const categories = productService.getCategories();

  // Selection states (Step 1 -> Step 2 -> Step 3)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("Grips");
  const [selectedProductId, setSelectedProductId] = useState<string>("prod-super-over-grip");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Products under current category
  const products = useMemo(() => {
    return productService.getProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Selected product object
  const activeProduct = useMemo(() => {
    const found = products.find((p) => p.id === selectedProductId);
    return found || products[0] || null;
  }, [products, selectedProductId]);

  // Models for active product
  const models = useMemo(() => {
    return activeProduct?.models || [];
  }, [activeProduct]);

  // Active Model
  const activeModel = useMemo(() => {
    if (!models.length) return null;
    const found = models.find((m) => m.id === selectedModelId);
    return found || models[0];
  }, [models, selectedModelId]);

  // Variants for active model (filtered by branch if specified)
  const modelVariants = useMemo(() => {
    if (!activeModel) return [];
    return productService.getVariants({
      modelId: activeModel.id,
      branchId: selectedBranch === "all" ? undefined : selectedBranch,
    });
  }, [activeModel, selectedBranch]);

  // Extract all unique attribute keys and possible values for current model
  const attributeMatrix = useMemo(() => {
    const keys = new Set<string>();
    const options: Record<string, Set<string>> = {};

    modelVariants.forEach((v) => {
      Object.entries(v.attributes).forEach(([k, val]) => {
        keys.add(k);
        if (!options[k]) options[k] = new Set();
        options[k].add(val);
      });
    });

    const result: { key: string; values: string[] }[] = [];
    keys.forEach((k) => {
      result.push({
        key: k,
        values: Array.from(options[k] || []),
      });
    });
    return result;
  }, [modelVariants]);

  // Find exact matching variant based on selected attributes
  const matchedVariant = useMemo(() => {
    if (!modelVariants.length) return null;
    if (attributeMatrix.length === 0) return modelVariants[0];

    // Find variant that satisfies all selected attributes
    const match = modelVariants.find((v) => {
      return Object.entries(selectedAttributes).every(
        ([key, val]) => v.attributes[key] === val
      );
    });

    return match || modelVariants[0];
  }, [modelVariants, selectedAttributes, attributeMatrix]);

  // Sync selected attributes when model changes
  React.useEffect(() => {
    if (modelVariants.length > 0) {
      const initialAttrs: Record<string, string> = {};
      const firstVar = modelVariants[0];
      Object.entries(firstVar.attributes).forEach(([k, v]) => {
        initialAttrs[k] = v;
      });
      setSelectedAttributes(initialAttrs);
    } else {
      setSelectedAttributes({});
    }
  }, [selectedModelId, selectedProductId, selectedCategory, modelVariants]);

  // Handle category switch
  const handleCategorySelect = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    const catProducts = productService.getProductsByCategory(cat);
    if (catProducts.length > 0) {
      setSelectedProductId(catProducts[0].id);
      if (catProducts[0].models.length > 0) {
        setSelectedModelId(catProducts[0].models[0].id);
      }
    }
  };

  // Handle product switch
  const handleProductSelect = (prod: ProductDefinition) => {
    setSelectedProductId(prod.id);
    if (prod.models.length > 0) {
      setSelectedModelId(prod.models[0].id);
    } else {
      setSelectedModelId("");
    }
  };

  const handleAddToCart = () => {
    if (!matchedVariant || matchedVariant.stockQuantity <= 0) return;

    const cartItem: CartItem = {
      variantId: matchedVariant.id,
      sku: matchedVariant.sku,
      category: matchedVariant.category,
      productName: matchedVariant.productName,
      modelName: matchedVariant.modelName,
      attributes: matchedVariant.attributes,
      unitPrice: matchedVariant.sellingPrice,
      costPrice: matchedVariant.costPrice,
      quantity: Math.min(quantity, matchedVariant.stockQuantity),
      maxStock: matchedVariant.stockQuantity,
    };

    onAddToCart(cartItem);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="space-y-6">
      {/* STEP 1: CATEGORY SELECTOR */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-sm">
              1
            </span>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
              Select Category
            </h3>
          </div>
          <span className="text-xs text-slate-600 font-medium">
            {categories.length} Categories Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = CATEGORY_ICONS[cat.id] || Layers;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={cn(
                  "relative flex flex-col items-center p-3 rounded-xl border text-left transition-all duration-200 group cursor-pointer",
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-transform duration-200 group-hover:scale-105",
                    isSelected
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-xs font-bold text-center leading-tight line-clamp-1",
                    isSelected ? "text-emerald-950 font-extrabold" : "text-slate-800"
                  )}
                >
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-600 mt-0.5">
                  {cat.productNames.length} items
                </span>

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: PRODUCT SELECTOR */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-sm">
              2
            </span>
            <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
              Select Product in <span className="text-emerald-800 font-extrabold">{selectedCategory}</span>
            </h3>
          </div>
          <span className="text-xs text-slate-600 font-medium">
            {products.length} Products
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {products.map((prod) => {
            const isSelected = activeProduct?.id === prod.id;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleProductSelect(prod)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 group cursor-pointer",
                  isSelected
                    ? "border-emerald-600 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="min-w-0 pr-2">
                  <h4
                    className={cn(
                      "text-xs font-bold truncate tracking-tight",
                      isSelected ? "text-emerald-950 font-extrabold" : "text-slate-800"
                    )}
                  >
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    {prod.models.length} Model{prod.models.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  )}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 3: DYNAMIC MODEL & VARIANT CONFIGURATOR */}
      {activeProduct && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-sm">
                3
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Configure {activeProduct.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {activeProduct.category}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {activeProduct.description}
                </p>
              </div>
            </div>

            {matchedVariant && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  SKU: {matchedVariant.sku}
                </span>
                <span
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1",
                    matchedVariant.status === "In Stock"
                      ? "bg-emerald-100 text-emerald-800"
                      : matchedVariant.status === "Low Stock"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {matchedVariant.status} ({matchedVariant.stockQuantity} left)
                </span>
              </div>
            )}
          </div>

          {/* Model Tabs (if product has multiple models) */}
          {models.length > 0 && (
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Select Model / Brand:
              </label>
              <div className="flex flex-wrap gap-2">
                {models.map((mod) => {
                  const isModSelected = activeModel?.id === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setSelectedModelId(mod.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        isModSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-900/10"
                          : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      )}
                    >
                      {mod.name}
                      {mod.brand && (
                        <span
                          className={cn(
                            "ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded",
                            isModSelected
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-200 text-slate-700"
                          )}
                        >
                          {mod.brand}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Variant Attributes Configurator */}
          {attributeMatrix.length > 0 ? (
            <div className="space-y-4 mb-6">
              {attributeMatrix.map(({ key, values }) => {
                const currentVal = selectedAttributes[key] || values[0];
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {key}:
                      </span>
                      <span className="text-xs font-semibold text-emerald-800">
                        {currentVal}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {values.map((val) => {
                        const isValSelected = currentVal === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setSelectedAttributes((prev) => ({
                                ...prev,
                                [key]: val,
                              }))
                            }
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                              isValSelected
                                ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                                : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-4 border border-slate-100">
              Standard default variant selected for this product model.
            </div>
          )}

          {/* Pricing & Add to Cart Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-600 block font-medium">
                Selling Price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  ₹{matchedVariant ? matchedVariant.sellingPrice.toFixed(2) : "0.00"}
                </span>
                {matchedVariant && matchedVariant.costPrice > 0 && (
                  <span className="text-xs text-slate-600">
                    (Cost: ₹{matchedVariant.costPrice.toFixed(2)})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={
                    !matchedVariant || quantity >= matchedVariant.stockQuantity
                  }
                  onClick={() =>
                    setQuantity((q) =>
                      matchedVariant ? Math.min(matchedVariant.stockQuantity, q + 1) : q + 1
                    )
                  }
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!matchedVariant || matchedVariant.stockQuantity <= 0}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer",
                  addedAnimation
                    ? "bg-emerald-700 text-white scale-95"
                    : !matchedVariant || matchedVariant.stockQuantity <= 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md"
                )}
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to POS Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
