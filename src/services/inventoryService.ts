import {
  InventoryItem,
  InventoryFilterOptions,
  StockStatus,
  PurchaseBillItem,
  INVENTORY_CATEGORIES,
} from "@/types/inventory";

const INVENTORY_STORAGE_KEY = "pba_inventory_v2";

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv-001", productName: "SUPER OVER GRIP", sku: "PBA-GRP-SOG",
    category: "Grips", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 60, sellingPrice: 0, openingStock: 50,
    purchasedQuantity: 50, soldQuantity: 12, currentStock: 38, availableStock: 38,
    lowStockThreshold: 10, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-002", productName: "SUPER GRIP", sku: "PBA-GRP-SUP",
    category: "Grips", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 80, sellingPrice: 0, openingStock: 60,
    purchasedQuantity: 60, soldQuantity: 18, currentStock: 42, availableStock: 42,
    lowStockThreshold: 10, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-003", productName: "GP-18", sku: "PBA-GRP-GP18",
    category: "Grips", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 70, sellingPrice: 0, openingStock: 45,
    purchasedQuantity: 45, soldQuantity: 10, currentStock: 35, availableStock: 35,
    lowStockThreshold: 8, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-004", productName: "SHOES", sku: "PBA-SHO-GEN",
    category: "Shoes & Footwear", hsnSac: "64041100", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 20,
    purchasedQuantity: 20, soldQuantity: 5, currentStock: 15, availableStock: 15,
    lowStockThreshold: 4, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-005", productName: "RACQUET", sku: "PBA-RQT-GEN",
    category: "Racquets", hsnSac: "95065100", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 25,
    purchasedQuantity: 25, soldQuantity: 8, currentStock: 17, availableStock: 17,
    lowStockThreshold: 5, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-006", productName: "KIT BAG", sku: "PBA-BAG-KIT",
    category: "Kit Bags", hsnSac: "42021220", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 18,
    purchasedQuantity: 18, soldQuantity: 4, currentStock: 14, availableStock: 14,
    lowStockThreshold: 4, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-007", productName: "INSOLES", sku: "PBA-ACC-INS",
    category: "Accessories", hsnSac: "64062000", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 30,
    purchasedQuantity: 30, soldQuantity: 9, currentStock: 21, availableStock: 21,
    lowStockThreshold: 6, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-008", productName: "SOCKS", sku: "PBA-APP-SCK",
    category: "Apparel & Jerseys", hsnSac: "61159900", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 50,
    purchasedQuantity: 50, soldQuantity: 22, currentStock: 28, availableStock: 28,
    lowStockThreshold: 10, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-009", productName: "SOCKS JN", sku: "PBA-APP-SCKJN",
    category: "Apparel & Jerseys", hsnSac: "61159900", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 40,
    purchasedQuantity: 40, soldQuantity: 14, currentStock: 26, availableStock: 26,
    lowStockThreshold: 8, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-010", productName: "KINESIOLOGY TAPE", sku: "PBA-SUP-KT",
    category: "Supports & Braces", hsnSac: "30059010", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 35,
    purchasedQuantity: 35, soldQuantity: 11, currentStock: 24, availableStock: 24,
    lowStockThreshold: 8, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-011", productName: "KNEE SUPPORT", sku: "PBA-SUP-KNE",
    category: "Supports & Braces", hsnSac: "90211000", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 22,
    purchasedQuantity: 22, soldQuantity: 6, currentStock: 16, availableStock: 16,
    lowStockThreshold: 5, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-012", productName: "WRISTBAND", sku: "PBA-ACC-WRB",
    category: "Accessories", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 40,
    purchasedQuantity: 40, soldQuantity: 15, currentStock: 25, availableStock: 25,
    lowStockThreshold: 8, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-013", productName: "WATER BOTTLE", sku: "PBA-ACC-WBT",
    category: "Accessories", hsnSac: "39239090", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 30,
    purchasedQuantity: 30, soldQuantity: 7, currentStock: 23, availableStock: 23,
    lowStockThreshold: 6, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-014", productName: "HEAD BAND", sku: "PBA-ACC-HDB",
    category: "Accessories", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 35,
    purchasedQuantity: 35, soldQuantity: 9, currentStock: 26, availableStock: 26,
    lowStockThreshold: 6, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-015", productName: "CAPS", sku: "PBA-APP-CAP",
    category: "Apparel & Jerseys", hsnSac: "65061000", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 28,
    purchasedQuantity: 28, soldQuantity: 8, currentStock: 20, availableStock: 20,
    lowStockThreshold: 5, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-016", productName: "TOWELS", sku: "PBA-ACC-TWL",
    category: "Accessories", hsnSac: "63014000", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 30,
    purchasedQuantity: 30, soldQuantity: 10, currentStock: 20, availableStock: 20,
    lowStockThreshold: 6, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-017", productName: "JUMP ROPE", sku: "PBA-EQP-JRP",
    category: "Court Equipment", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 20,
    purchasedQuantity: 20, soldQuantity: 5, currentStock: 15, availableStock: 15,
    lowStockThreshold: 4, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-018", productName: "YOGA MAT", sku: "PBA-EQP-YGM",
    category: "Court Equipment", hsnSac: "39269099", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 15,
    purchasedQuantity: 15, soldQuantity: 3, currentStock: 12, availableStock: 12,
    lowStockThreshold: 3, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-019", productName: "BACK PACK", sku: "PBA-BAG-BPK",
    category: "Kit Bags", hsnSac: "42021220", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 18,
    purchasedQuantity: 18, soldQuantity: 5, currentStock: 13, availableStock: 13,
    lowStockThreshold: 4, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-020", productName: "SHOE BAG", sku: "PBA-BAG-SHB",
    category: "Kit Bags", hsnSac: "42021220", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 25,
    purchasedQuantity: 25, soldQuantity: 7, currentStock: 18, availableStock: 18,
    lowStockThreshold: 5, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-021", productName: "ANKLE SUPPORT", sku: "PBA-SUP-ANK",
    category: "Supports & Braces", hsnSac: "90211000", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 20,
    purchasedQuantity: 20, soldQuantity: 5, currentStock: 15, availableStock: 15,
    lowStockThreshold: 5, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-022", productName: "STRINGS", sku: "PBA-STR-GEN",
    category: "Strings", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 40,
    purchasedQuantity: 40, soldQuantity: 13, currentStock: 27, availableStock: 27,
    lowStockThreshold: 8, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-023", productName: "SHUTTLE COCKS", sku: "PBA-SHT-PLA",
    category: "Shuttlecocks", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 80,
    purchasedQuantity: 80, soldQuantity: 32, currentStock: 48, availableStock: 48,
    lowStockThreshold: 15, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-024", productName: "T-SHIRTS", sku: "PBA-APP-TSH",
    category: "Apparel & Jerseys", hsnSac: "61091000", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 40,
    purchasedQuantity: 40, soldQuantity: 14, currentStock: 26, availableStock: 26,
    lowStockThreshold: 8, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-025", productName: "SHORTS", sku: "PBA-APP-SHR",
    category: "Apparel & Jerseys", hsnSac: "62034200", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 35,
    purchasedQuantity: 35, soldQuantity: 10, currentStock: 25, availableStock: 25,
    lowStockThreshold: 7, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-026", productName: "MEN'S SLEEVELESS TOP", sku: "PBA-APP-MST",
    category: "Apparel & Jerseys", hsnSac: "61091000", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 28,
    purchasedQuantity: 28, soldQuantity: 8, currentStock: 20, availableStock: 20,
    lowStockThreshold: 6, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-027", productName: "UNISEX WARM UP JACKET", sku: "PBA-APP-WUJ",
    category: "Apparel & Jerseys", hsnSac: "61011000", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 22,
    purchasedQuantity: 22, soldQuantity: 6, currentStock: 16, availableStock: 16,
    lowStockThreshold: 5, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "inv-028", productName: "FEATHER SHUTTLES", sku: "PBA-SHT-FTH",
    category: "Shuttlecocks", hsnSac: "95069990", supplier: "PBA Store",
    purchasePrice: 0, sellingPrice: 0, openingStock: 60,
    purchasedQuantity: 60, soldQuantity: 20, currentStock: 40, availableStock: 40,
    lowStockThreshold: 12, status: "In Stock", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
  },
];

class InventoryService {
  private items: InventoryItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private computeStatus(currentStock: number, threshold: number): StockStatus {
    if (currentStock <= 0) return "Out of Stock";
    if (currentStock <= threshold) return "Low Stock";
    return "In Stock";
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (stored) {
          this.items = JSON.parse(stored);
          return;
        }
      } catch {
        // Fall back to initial dataset
      }
    }
    this.items = [...INITIAL_INVENTORY];
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(this.items));
      } catch {
        // Ignore storage errors
      }
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.saveToStorage();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("inventory-data-updated"));
      window.dispatchEvent(new CustomEvent("excel-data-updated"));
    }
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // Ignore subscriber errors
      }
    });
  }

  public getInventory(filter?: InventoryFilterOptions): InventoryItem[] {
    let list = [...this.items];

    if (filter) {
      if (filter.category && filter.category !== "All" && filter.category !== "all") {
        list = list.filter((i) => i.category === filter.category);
      }
      if (filter.supplier && filter.supplier !== "All" && filter.supplier !== "all") {
        list = list.filter((i) => i.supplier === filter.supplier);
      }
      if (
        filter.stockStatus &&
        (filter.stockStatus as string) !== "All" &&
        (filter.stockStatus as string) !== "all"
      ) {
        list = list.filter((i) => i.status === filter.stockStatus);
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.trim().toLowerCase();
        list = list.filter(
          (i) =>
            i.productName.toLowerCase().includes(q) ||
            i.sku.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q) ||
            (i.supplier && i.supplier.toLowerCase().includes(q)) ||
            i.hsnSac.includes(q)
        );
      }
    }

    return list;
  }

  public getById(id: string): InventoryItem | undefined {
    return this.items.find((i) => i.id === id);
  }

  public getInventorySummary(): {
    totalItems: number;
    totalQuantity: number;
    totalRetailValue: number;
    totalCostValue: number;
    inStockItems: number;
    lowStockItems: number;
    outOfStockItems: number;
  } {
    const list = this.items;

    const totalItems = list.length;
    const totalQuantity = list.reduce((sum, i) => sum + i.currentStock, 0);
    const totalRetailValue = list.reduce(
      (sum, i) => sum + i.currentStock * i.sellingPrice,
      0
    );
    const totalCostValue = list.reduce(
      (sum, i) => sum + i.currentStock * i.purchasePrice,
      0
    );
    const inStockItems = list.filter((i) => i.status === "In Stock").length;
    const lowStockItems = list.filter((i) => i.status === "Low Stock").length;
    const outOfStockItems = list.filter((i) => i.status === "Out of Stock").length;

    return {
      totalItems,
      totalQuantity,
      totalRetailValue,
      totalCostValue,
      inStockItems,
      lowStockItems,
      outOfStockItems,
    };
  }

  public findDuplicateProduct(name: string): InventoryItem | undefined {
    return this.findProductByName(name);
  }

  public findProductByName(name: string): InventoryItem | undefined {
    const clean = name.trim().toLowerCase();
    // 1. Direct exact match
    let match = this.items.find(
      (i) => i.productName.trim().toLowerCase() === clean
    );
    if (match) return match;

    // 2. Substring match
    match = this.items.find(
      (i) =>
        i.productName.toLowerCase().includes(clean) || clean.includes(i.productName.toLowerCase())
    );
    if (match) return match;

    return undefined;
  }

  /**
   * Check if requested quantity is available in stock
   */
  public checkStock(productName: string, qtyNeeded: number): { available: boolean; currentStock: number } {
    let prod = this.findProductByName(productName);
    if (!prod) {
      // Auto-provision product with default opening stock
      const res = this.addProduct({
        productName,
        category: this.inferCategory(productName),
        hsnSac: "95069990",
        purchasePrice: 500,
        sellingPrice: 750,
        openingStock: 20,
      });
      prod = res.item;
    }
    return {
      available: prod.currentStock >= qtyNeeded,
      currentStock: prod.currentStock,
    };
  }

  /**
   * Deduct stock upon sale in PBA Store
   */
  public recordSale(productName: string, qty: number): boolean {
    const prod = this.findProductByName(productName);
    if (!prod) {
      return false;
    }
    const newSold = prod.soldQuantity + qty;
    const newCurrent = Math.max(0, prod.openingStock + prod.purchasedQuantity - newSold);
    prod.soldQuantity = newSold;
    prod.currentStock = newCurrent;
    prod.availableStock = newCurrent;
    prod.status = this.computeStatus(newCurrent, prod.lowStockThreshold);
    prod.updatedAt = new Date().toISOString();

    this.notify();
    return true;
  }

  /**
   * Reverse a sale (e.g. refund/cancellation)
   */
  public reverseSale(productName: string, qty: number): void {
    const prod = this.findProductByName(productName);
    if (!prod) return;

    const newSold = Math.max(0, prod.soldQuantity - qty);
    const newCurrent = Math.max(0, prod.openingStock + prod.purchasedQuantity - newSold);
    prod.soldQuantity = newSold;
    prod.currentStock = newCurrent;
    prod.availableStock = newCurrent;
    prod.status = this.computeStatus(newCurrent, prod.lowStockThreshold);
    prod.updatedAt = new Date().toISOString();

    this.notify();
  }

  /**
   * Auto-add stock when a Purchase Bill is created
   */
  public addPurchaseStock(
    items: PurchaseBillItem[],
    supplierName: string,
    invoiceDate: string
  ): void {
    for (const item of items) {
      const existing = this.findProductByName(item.productName);
      if (existing) {
        existing.purchasedQuantity += item.quantity;
        const newCurrent = Math.max(0, existing.openingStock + existing.purchasedQuantity - existing.soldQuantity);
        existing.currentStock = newCurrent;
        existing.availableStock = newCurrent;
        existing.purchasePrice = item.rate;
        existing.supplier = supplierName;
        existing.lastPurchaseDate = invoiceDate;
        existing.hsnSac = item.hsnSac || existing.hsnSac;
        existing.status = this.computeStatus(newCurrent, existing.lowStockThreshold);
        existing.updatedAt = new Date().toISOString();
      } else {
        // Auto-create new product in inventory
        const sku = `PB-${item.productName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        const newItem: InventoryItem = {
          id: `inv-${crypto.randomUUID()}`,
          productName: item.productName.trim(),
          sku,
          category: this.inferCategory(item.productName),
          hsnSac: item.hsnSac || "95069990",
          supplier: supplierName,
          purchasePrice: item.rate,
          sellingPrice: Math.round(item.rate * 1.35),
          openingStock: 0,
          purchasedQuantity: item.quantity,
          soldQuantity: 0,
          currentStock: item.quantity,
          availableStock: item.quantity,
          lowStockThreshold: 5,
          lastPurchaseDate: invoiceDate,
          status: this.computeStatus(item.quantity, 5),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.items.unshift(newItem);
      }
    }
    this.notify();
  }

  /**
   * Revert purchase stock when a Purchase Bill is deleted or modified
   */
  public revertPurchaseStock(items: PurchaseBillItem[]): void {
    for (const item of items) {
      const existing = this.findProductByName(item.productName);
      if (existing) {
        existing.purchasedQuantity = Math.max(0, existing.purchasedQuantity - item.quantity);
        const newCurrent = Math.max(0, existing.openingStock + existing.purchasedQuantity - existing.soldQuantity);
        existing.currentStock = newCurrent;
        existing.availableStock = newCurrent;
        existing.status = this.computeStatus(newCurrent, existing.lowStockThreshold);
        existing.updatedAt = new Date().toISOString();
      }
    }
    this.notify();
  }

  /**
   * Manual Add Product inside Inventory
   */
  public addProduct(
    data: {
      productName: string;
      category: string;
      hsnSac: string;
      supplier?: string;
      purchasePrice: number;
      sellingPrice: number;
      openingStock: number;
      lowStockThreshold?: number;
      notes?: string;
    },
    mode: "create_new_sku" | "increase_existing" = "increase_existing"
  ): { item: InventoryItem; action: "created" | "updated" } {
    const existing = this.findProductByName(data.productName);

    if (existing && mode === "increase_existing") {
      existing.openingStock += data.openingStock || 0;
      const newCurrent = Math.max(0, existing.openingStock + existing.purchasedQuantity - existing.soldQuantity);
      existing.currentStock = newCurrent;
      existing.availableStock = newCurrent;
      existing.purchasePrice = data.purchasePrice || existing.purchasePrice;
      existing.sellingPrice = data.sellingPrice || existing.sellingPrice;
      if (data.supplier) existing.supplier = data.supplier;
      if (data.hsnSac) existing.hsnSac = data.hsnSac;
      if (data.category) existing.category = data.category;
      if (data.lowStockThreshold !== undefined) existing.lowStockThreshold = data.lowStockThreshold;
      existing.status = this.computeStatus(newCurrent, existing.lowStockThreshold);
      existing.updatedAt = new Date().toISOString();

      this.notify();
      return { item: existing, action: "updated" };
    }

    const count = this.items.length + 1;
    const catCode = (data.category || "ACC").substring(0, 3).toUpperCase();
    const sku = `PB-${catCode}-${String(count).padStart(3, "0")}`;

    const currentStock = data.openingStock || 0;
    const threshold = data.lowStockThreshold ?? 5;

    const newItem: InventoryItem = {
      id: `inv-${crypto.randomUUID()}`,
      productName: data.productName.trim(),
      sku,
      category: data.category,
      hsnSac: data.hsnSac || "95069990",
      supplier: data.supplier || "Direct Inventory Addition",
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      openingStock: data.openingStock || 0,
      purchasedQuantity: 0,
      soldQuantity: 0,
      currentStock,
      availableStock: currentStock,
      lowStockThreshold: threshold,
      status: this.computeStatus(currentStock, threshold),
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.items.unshift(newItem);
    this.notify();
    return { item: newItem, action: "created" };
  }

  public updateProduct(id: string, updates: Partial<InventoryItem>): InventoryItem {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`Product ${id} not found`);

    const existing = this.items[idx];
    const openingStock = updates.openingStock !== undefined ? updates.openingStock : existing.openingStock;
    const purchasedQuantity = updates.purchasedQuantity !== undefined ? updates.purchasedQuantity : existing.purchasedQuantity;
    const soldQuantity = updates.soldQuantity !== undefined ? updates.soldQuantity : existing.soldQuantity;
    const currentStock = Math.max(0, openingStock + purchasedQuantity - soldQuantity);
    const lowStockThreshold = updates.lowStockThreshold !== undefined ? updates.lowStockThreshold : existing.lowStockThreshold;

    const updated: InventoryItem = {
      ...existing,
      ...updates,
      openingStock,
      purchasedQuantity,
      soldQuantity,
      currentStock,
      availableStock: currentStock,
      lowStockThreshold,
      status: this.computeStatus(currentStock, lowStockThreshold),
      updatedAt: new Date().toISOString(),
    };

    this.items[idx] = updated;
    this.notify();
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    if (this.items.length !== initialLen) {
      this.notify();
      return true;
    }
    return false;
  }

  private inferCategory(productName: string): string {
    const p = productName.toLowerCase();
    if (p.includes("racquet") || p.includes("racket")) return "Racquets";
    if (p.includes("shuttle") || p.includes("cork")) return "Shuttlecocks";
    if (p.includes("grip")) return "Grips";
    if (p.includes("string")) return "Strings";
    if (p.includes("bag") || p.includes("backpack")) return "Kit Bags";
    if (p.includes("shoe") || p.includes("footwear")) return "Shoes & Footwear";
    if (p.includes("t-shirt") || p.includes("jersey") || p.includes("short") || p.includes("jacket")) return "Apparel & Jerseys";
    if (p.includes("support") || p.includes("knee") || p.includes("ankle") || p.includes("wrist")) return "Supports & Braces";
    return "Accessories";
  }
}

export const inventoryService = new InventoryService();
