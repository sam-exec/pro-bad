"use client";

import React, { useState } from "react";
import {
  ProductCategory,
  ProductDefinition,
  ProductModel,
  ProductVariant,
} from "@/types/products";
import { productService } from "@/services/productService";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Layers,
  Package,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Flame,
  HandMetal,
  Briefcase,
  ShieldCheck,
  Activity,
  Shirt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCatalogManagerProps {
  onOpenAddModal: (productId?: string) => void;
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

export function ProductCatalogManager({
  onOpenAddModal,
}: ProductCatalogManagerProps) {
  const categories = productService.getCategories();
  const allProducts = productService.getAllProducts();

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    Grips: true,
    Equipment: true,
    "Badminton Consumables": true,
  });

  const [expandedProducts, setExpandedProducts] = useState<
    Record<string, boolean>
  >({
    "prod-racquet": true,
    "prod-feather-shuttles": true,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const toggleProduct = (prodId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [prodId]: !prev[prodId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Product & Model Catalog Hierarchy
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized hierarchy: 7 Categories ➔ Products ➔ Models ➔ Dynamic Variants & SKUs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenAddModal()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Model / Variant</span>
        </button>
      </div>

      {/* Categories Accordion Tree */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const isCatExpanded = !!expandedCategories[cat.id];
          const catProducts = allProducts.filter((p) => p.category === cat.id);
          const Icon = CATEGORY_ICONS[cat.id] || Layers;
          const totalCatVariants = productService.getVariants({
            category: cat.id,
          });

          return (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all"
            >
              {/* Category Header */}
              <div
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/60 cursor-pointer border-b border-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                        {catProducts.length} Products
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {totalCatVariants.length} Active SKUs
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  {isCatExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Products within Category */}
              {isCatExpanded && (
                <div className="p-4 space-y-3 bg-white">
                  {catProducts.map((prod) => {
                    const isProdExpanded = !!expandedProducts[prod.id];
                    const prodVariants = productService.getVariants({
                      productId: prod.id,
                    });

                    return (
                      <div
                        key={prod.id}
                        className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30"
                      >
                        {/* Product Row */}
                        <div
                          onClick={() => toggleProduct(prod.id)}
                          className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 select-none"
                        >
                          <div className="flex items-center gap-2.5">
                            {isProdExpanded ? (
                              <ChevronDown className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                                {prod.name}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                {prod.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-500">
                              {prod.models.length} Model{prod.models.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">
                              {prodVariants.length} Variants
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAddModal(prod.id);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Model/Variant</span>
                            </button>
                          </div>
                        </div>

                        {/* Models & Variants Tree */}
                        {isProdExpanded && (
                          <div className="p-3.5 space-y-3 bg-slate-50/50">
                            {prod.models.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">
                                No models configured yet for this product.
                              </p>
                            ) : (
                              prod.models.map((mod) => {
                                const modVariants = productService.getVariants({
                                  modelId: mod.id,
                                });

                                return (
                                  <div
                                    key={mod.id}
                                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-xs font-bold text-slate-900">
                                          {mod.name}
                                        </h5>
                                        {mod.brand && (
                                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold">
                                            {mod.brand}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-semibold">
                                        {modVariants.length} Active Variant{modVariants.length !== 1 ? "s" : ""}
                                      </span>
                                    </div>

                                    {/* Variant Pill Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {modVariants.map((v) => (
                                        <div
                                          key={v.id}
                                          className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors text-xs"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono font-bold text-[11px] text-slate-900">
                                              {v.sku}
                                            </span>
                                            <span className="font-extrabold text-emerald-700 text-xs">
                                              ${v.sellingPrice.toFixed(2)}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-600 truncate font-medium">
                                            {Object.entries(v.attributes)
                                              .map(([k, val]) => `${k}: ${val}`)
                                              .join(" • ") || "Default"}
                                          </p>
                                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/60 text-[10px]">
                                            <span className="text-slate-500 font-medium">
                                              Stock: <b>{v.stockQuantity}</b>
                                            </span>
                                            <span
                                              className={cn(
                                                "font-bold px-1.5 py-0.2 rounded",
                                                v.status === "In Stock"
                                                  ? "bg-emerald-100 text-emerald-800"
                                                  : v.status === "Low Stock"
                                                  ? "bg-amber-100 text-amber-800"
                                                  : "bg-rose-100 text-rose-800"
                                              )}
                                            >
                                              {v.status}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
