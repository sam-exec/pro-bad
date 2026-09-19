import {
  CategoryDefinition,
  ProductCategory,
  ProductDefinition,
  ProductModel,
  ProductVariant,
  POSSalePayload,
  InvoiceDetails,
  VariantStatus,
} from "@/types/products";
import {
  CATEGORIES_CONFIG,
  PRODUCT_DEFINITIONS,
  INITIAL_VARIANTS,
} from "@/data/products-mock";
import { salesService } from "./excel/salesService";

class ProductService {
  private categories: CategoryDefinition[] = [...CATEGORIES_CONFIG];
  private products: ProductDefinition[] = JSON.parse(JSON.stringify(PRODUCT_DEFINITIONS));
  private variants: ProductVariant[] = [...INITIAL_VARIANTS];
  private invoices: InvoiceDetails[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.linkModelsAndVariants();
  }

  private linkModelsAndVariants() {
    // Populate models with their initial variants
    for (const prod of this.products) {
      for (const mod of prod.models) {
        mod.variants = this.variants.filter((v) => v.modelId === mod.id);
      }
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // Ignore subscriber errors
      }
    });
  }

  // --- Category APIs ---
  public getCategories(): CategoryDefinition[] {
    return this.categories;
  }

  // --- Product & Model APIs ---
  public getAllProducts(): ProductDefinition[] {
    return this.products;
  }

  public getProductsByCategory(category: ProductCategory): ProductDefinition[] {
    return this.products.filter((p) => p.category === category);
  }

  public getProductById(id: string): ProductDefinition | undefined {
    return this.products.find((p) => p.id === id);
  }

  public addModel(
    productId: string,
    modelData: {
      name: string;
      brand?: string;
      description?: string;
      basePrice?: number;
      supportedAttributeKeys?: string[];
    }
  ): ProductModel {
    const product = this.products.find((p) => p.id === productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    const modelId = `mod-${productId.replace("prod-", "")}-${crypto.randomUUID().slice(0, 8)}`;
    const newModel: ProductModel = {
      id: modelId,
      productId,
      name: modelData.name,
      brand: modelData.brand || "ProBad",
      description: modelData.description || "",
      basePrice: modelData.basePrice || 0,
      supportedAttributeKeys:
        modelData.supportedAttributeKeys || product.defaultAttributeKeys,
      variants: [],
    };

    product.models.push(newModel);
    this.notify();
    return newModel;
  }

  // --- Variant APIs ---
  public getVariants(filter?: {
    category?: ProductCategory | "All";
    productId?: string;
    modelId?: string;
    search?: string;
    status?: VariantStatus | "All";
    lowStockOnly?: boolean;
  }): ProductVariant[] {
    let list = [...this.variants];

    if (filter) {
      if (filter.category && filter.category !== "All") {
        list = list.filter((v) => v.category === filter.category);
      }
      if (filter.productId && filter.productId !== "all") {
        list = list.filter((v) => v.productId === filter.productId);
      }
      if (filter.modelId) {
        list = list.filter((v) => v.modelId === filter.modelId);
      }
      if (filter.status && filter.status !== "All") {
        list = list.filter((v) => v.status === filter.status);
      }
      if (filter.lowStockOnly) {
        list = list.filter((v) => v.stockQuantity <= v.lowStockThreshold);
      }
      if (filter.search && filter.search.trim()) {
        const query = filter.search.trim().toLowerCase();
        list = list.filter(
          (v) =>
            v.sku.toLowerCase().includes(query) ||
            v.modelName.toLowerCase().includes(query) ||
            v.productName.toLowerCase().includes(query) ||
            v.category.toLowerCase().includes(query) ||
            Object.values(v.attributes).some((val) =>
              val.toLowerCase().includes(query)
            )
        );
      }
    }

    return list;
  }

  public getVariantById(id: string): ProductVariant | undefined {
    return this.variants.find((v) => v.id === id);
  }

  public addVariant(
    variantData: Omit<ProductVariant, "id" | "status" | "createdAt" | "updatedAt">
  ): ProductVariant {
    const timestamp = new Date().toISOString();
    const id = `var-${crypto.randomUUID()}`;

    let status: VariantStatus = "In Stock";
    if (variantData.stockQuantity <= 0) {
      status = "Out of Stock";
    } else if (variantData.stockQuantity <= variantData.lowStockThreshold) {
      status = "Low Stock";
    }

    const newVariant: ProductVariant = {
      ...variantData,
      id,
      status,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.variants.push(newVariant);

    // Also attach to model
    for (const prod of this.products) {
      const model = prod.models.find((m) => m.id === newVariant.modelId);
      if (model) {
        model.variants.push(newVariant);
        break;
      }
    }

    this.notify();
    return newVariant;
  }

  public updateVariant(
    id: string,
    updates: Partial<Omit<ProductVariant, "id" | "createdAt">>
  ): ProductVariant {
    const idx = this.variants.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error(`Variant ${id} not found`);

    const existing = this.variants[idx];
    const updatedStock =
      updates.stockQuantity !== undefined
        ? updates.stockQuantity
        : existing.stockQuantity;
    const threshold =
      updates.lowStockThreshold !== undefined
        ? updates.lowStockThreshold
        : existing.lowStockThreshold;

    let computedStatus: VariantStatus = existing.status;
    if (updatedStock <= 0) {
      computedStatus = "Out of Stock";
    } else if (updatedStock <= threshold) {
      computedStatus = "Low Stock";
    } else {
      computedStatus = "In Stock";
    }

    const updatedVariant: ProductVariant = {
      ...existing,
      ...updates,
      stockQuantity: Math.max(0, updatedStock),
      status: computedStatus,
      updatedAt: new Date().toISOString(),
    };

    this.variants[idx] = updatedVariant;

    // Update in product tree
    this.linkModelsAndVariants();
    this.notify();
    return updatedVariant;
  }

  public adjustStock(
    variantId: string,
    changeQty: number,
    _reason?: string
  ): ProductVariant {
    const variant = this.getVariantById(variantId);
    if (!variant) throw new Error(`Variant ${variantId} not found`);

    const newQty = Math.max(0, variant.stockQuantity + changeQty);
    return this.updateVariant(variantId, { stockQuantity: newQty });
  }

  public deleteVariant(id: string): boolean {
    const initialLen = this.variants.length;
    this.variants = this.variants.filter((v) => v.id !== id);
    if (this.variants.length !== initialLen) {
      this.linkModelsAndVariants();
      this.notify();
      return true;
    }
    return false;
  }

  // --- POS / Checkout & Invoicing ---
  public async processPOSSale(payload: POSSalePayload): Promise<InvoiceDetails> {
    const timestamp = new Date().toISOString();
    const count = this.invoices.length + 1;
    const invoiceNumber = `INV-2026-${String(100 + count).padStart(4, "0")}`;
    const invoiceId = `inv-${crypto.randomUUID()}`;

    // 1. Decrement inventory for each variant
    for (const item of payload.items) {
      const variant = this.getVariantById(item.variantId);
      if (variant) {
        const newStock = Math.max(0, variant.stockQuantity - item.quantity);
        this.updateVariant(item.variantId, { stockQuantity: newStock });
      }
    }

    // 2. Format invoice record
    const invoice: InvoiceDetails = {
      ...payload,
      id: invoiceId,
      invoiceNumber,
      saleDate: timestamp,
      status: "Paid",
    };

    this.invoices.unshift(invoice);

    // 3. Connect and write to existing Excel Sales service
    try {
      const itemSummaries = payload.items
        .map(
          (i) =>
            `${i.quantity}x ${i.productName} (${i.modelName} - ${Object.values(
              i.attributes
            ).join(", ")})`
        )
        .join("; ");

      await salesService.create(
        {
          customerName: payload.customerName || "Walk-in Customer",
          customerMobile: payload.customerMobile || "N/A",
          category: "Merchandise",
          description: itemSummaries,
          amount: payload.totalAmount,
          paymentMethod: payload.paymentMethod,
          date: timestamp.split("T")[0],
        },
        {
          employeeId: payload.employeeId || "EMP001",
          employeeName: payload.employeeName || "Staff Member",
        }
      );
    } catch {
      // Excel sync fallback
    }

    this.notify();
    return invoice;
  }

  public getInvoices(): InvoiceDetails[] {
    return this.invoices;
  }

  public getInventoryStats() {
    const list = this.getVariants();
    const totalUnits = list.reduce((acc, v) => acc + v.stockQuantity, 0);
    const totalValuation = list.reduce(
      (acc, v) => acc + v.stockQuantity * v.sellingPrice,
      0
    );
    const totalCostValuation = list.reduce(
      (acc, v) => acc + v.stockQuantity * v.costPrice,
      0
    );
    const lowStockCount = list.filter((v) => v.status === "Low Stock").length;
    const outOfStockCount = list.filter((v) => v.status === "Out of Stock").length;

    return {
      totalVariants: list.length,
      totalUnits,
      totalValuation,
      totalCostValuation,
      projectedMargin:
        totalValuation > 0
          ? Math.round(
              ((totalValuation - totalCostValuation) / totalValuation) * 100
            )
          : 0,
      lowStockCount,
      outOfStockCount,
    };
  }
}

export const productService = new ProductService();
export default productService;
