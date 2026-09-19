import {
  PurchaseBill,
  PurchaseBillItem,
  PurchaseHistoryFilterOptions,
} from "@/types/inventory";
import { inventoryService } from "./inventoryService";

const PURCHASE_STORAGE_KEY = "pro_badminton_purchase_bills_single_loc_v1";

const INITIAL_PURCHASE_BILLS: PurchaseBill[] = [
  {
    id: "bill-001",
    invoiceNumber: "SSI/2026/03/0142",
    invoiceDate: "2026-03-01",
    supplierName: "Sunrise Sports India Pvt Ltd",
    supplierAddress: "Plot No. 42, IDA Cherlapally, Hyderabad, Telangana 500051",
    gstNumber: "36AABCS1429B1Z2",
    panNumber: "AABCS1429B",
    phoneNumber: "+91 98490 12345",
    placeOfSupply: "Telangana (36)",
    notes: "Official Yonex authorized distributor consignment",
    items: [
      {
        id: "pitem-001",
        productName: "Yonex Astrox 100ZZ",
        description: "4U G5 Kurenai Frame",
        hsnSac: "95065100",
        taxRate: 18,
        quantity: 15,
        unit: "Pcs",
        rate: 16500,
        taxableAmount: 247500,
        taxAmount: 44550,
        amount: 292050,
      },
      {
        id: "pitem-002",
        productName: "Yonex Aerosensa 30 Feather Shuttles",
        description: "Speed 77 Tournament Tube of 12",
        hsnSac: "95069990",
        taxRate: 12,
        quantity: 50,
        unit: "Tubes",
        rate: 2200,
        taxableAmount: 110000,
        taxAmount: 13200,
        amount: 123200,
      },
    ],
    totalQuantity: 65,
    taxableAmount: 357500,
    gstAmount: 57750,
    roundOff: 0,
    grandTotal: 415250,
    status: "Verified",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    createdAt: "2026-03-01T10:30:00Z",
    updatedAt: "2026-03-01T10:30:00Z",
  },
  {
    id: "bill-002",
    invoiceNumber: "VBD/HYD/2026/89",
    invoiceDate: "2026-02-28",
    supplierName: "Victor Badminton Distributor",
    supplierAddress: "Shop 14, Sports Complex, Secunderabad, Telangana 500003",
    gstNumber: "36AACCV9910D1Z7",
    panNumber: "AACCV9910D",
    phoneNumber: "+91 98495 67890",
    placeOfSupply: "Telangana (36)",
    notes: "Overgrips & Pro Bags delivery",
    items: [
      {
        id: "pitem-003",
        productName: "Yonex Super AC102EX Overgrip",
        description: "Pack of 3 - Assorted Colors",
        hsnSac: "95069990",
        taxRate: 18,
        quantity: 60,
        unit: "Pcs",
        rate: 180,
        taxableAmount: 10800,
        taxAmount: 1944,
        amount: 12744,
      },
      {
        id: "pitem-004",
        productName: "Pro 9-Racquet Thermo Kit Bag",
        description: "Midnight Black 9-pack thermo guard",
        hsnSac: "42021220",
        taxRate: 18,
        quantity: 10,
        unit: "Pcs",
        rate: 4800,
        taxableAmount: 48000,
        taxAmount: 8640,
        amount: 56640,
      },
    ],
    totalQuantity: 70,
    taxableAmount: 58800,
    gstAmount: 10584,
    roundOff: 0,
    grandTotal: 69384,
    status: "Completed",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    createdAt: "2026-02-28T14:15:00Z",
    updatedAt: "2026-02-28T14:15:00Z",
  },
  {
    id: "bill-003",
    invoiceNumber: "SSI/2026/03/0188",
    invoiceDate: "2026-03-01",
    supplierName: "Sunrise Sports India Pvt Ltd",
    supplierAddress: "Plot No. 42, IDA Cherlapally, Hyderabad, Telangana 500051",
    gstNumber: "36AABCS1429B1Z2",
    panNumber: "AABCS1429B",
    phoneNumber: "+91 98490 12345",
    placeOfSupply: "Telangana (36)",
    notes: "Seasonal restock consignment",
    items: [
      {
        id: "pitem-005",
        productName: "Li-Ning Axforce 80",
        description: "4U G5 Dark Blue",
        hsnSac: "95065100",
        taxRate: 18,
        quantity: 12,
        unit: "Pcs",
        rate: 14200,
        taxableAmount: 170400,
        taxAmount: 30672,
        amount: 201072,
      },
      {
        id: "pitem-006",
        productName: "Victor Master No.1 Shuttles",
        description: "Speed 77 Tube of 12",
        hsnSac: "95069990",
        taxRate: 12,
        quantity: 35,
        unit: "Tubes",
        rate: 2400,
        taxableAmount: 84000,
        taxAmount: 10080,
        amount: 94080,
      },
    ],
    totalQuantity: 47,
    taxableAmount: 254400,
    gstAmount: 40752,
    roundOff: 0,
    grandTotal: 295152,
    status: "Verified",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    createdAt: "2026-03-01T15:00:00Z",
    updatedAt: "2026-03-01T15:00:00Z",
  },
  {
    id: "bill-004",
    invoiceNumber: "VBD/HYD/2026/92",
    invoiceDate: "2026-02-25",
    supplierName: "Victor Badminton Distributor",
    supplierAddress: "Shop 14, Sports Complex, Secunderabad, Telangana 500003",
    gstNumber: "36AACCV9910D1Z7",
    panNumber: "AACCV9910D",
    phoneNumber: "+91 98495 67890",
    placeOfSupply: "Telangana (36)",
    notes: "Grips bulk shipment",
    items: [
      {
        id: "pitem-007",
        productName: "Victor GP-18 Grip",
        description: "Pack of 10 - Yellow/Black",
        hsnSac: "95069990",
        taxRate: 18,
        quantity: 40,
        unit: "Pcs",
        rate: 160,
        taxableAmount: 6400,
        taxAmount: 1152,
        amount: 7552,
      },
    ],
    totalQuantity: 40,
    taxableAmount: 6400,
    gstAmount: 1152,
    roundOff: 0,
    grandTotal: 7552,
    status: "Completed",
    employeeId: "EMP001",
    employeeName: "Rahul Sharma",
    createdAt: "2026-02-25T11:20:00Z",
    updatedAt: "2026-02-25T11:20:00Z",
  },
];

class PurchaseHistoryService {
  private bills: PurchaseBill[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(PURCHASE_STORAGE_KEY);
        if (stored) {
          this.bills = JSON.parse(stored);
          return;
        }
      } catch {
        // Fall back to initial dataset
      }
    }
    this.bills = [...INITIAL_PURCHASE_BILLS];
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(this.bills));
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
      window.dispatchEvent(new CustomEvent("purchase-bills-updated"));
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

  public getBills(filter?: PurchaseHistoryFilterOptions): PurchaseBill[] {
    let list = [...this.bills];

    if (filter) {
      if (filter.supplier && filter.supplier !== "All" && filter.supplier !== "all") {
        list = list.filter((b) => b.supplierName === filter.supplier);
      }
      if (filter.status && filter.status !== "All" && filter.status !== "all") {
        list = list.filter((b) => b.status === filter.status);
      }
      if (filter.startDate) {
        list = list.filter((b) => b.invoiceDate >= filter.startDate!);
      }
      if (filter.endDate) {
        list = list.filter((b) => b.invoiceDate <= filter.endDate!);
      }
      if (filter.dateFilter && filter.dateFilter !== "all") {
        const today = new Date().toISOString().split("T")[0];
        if (filter.dateFilter === "today") {
          list = list.filter((b) => b.invoiceDate === today);
        } else if (filter.dateFilter === "week") {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          const weekAgo = d.toISOString().split("T")[0];
          list = list.filter((b) => b.invoiceDate >= weekAgo);
        } else if (filter.dateFilter === "month") {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          const monthAgo = d.toISOString().split("T")[0];
          list = list.filter((b) => b.invoiceDate >= monthAgo);
        }
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.trim().toLowerCase();
        list = list.filter(
          (b) =>
            b.invoiceNumber.toLowerCase().includes(q) ||
            b.supplierName.toLowerCase().includes(q) ||
            b.gstNumber.toLowerCase().includes(q) ||
            b.panNumber.toLowerCase().includes(q) ||
            b.phoneNumber.includes(q) ||
            b.items.some(
              (i) =>
                i.productName.toLowerCase().includes(q) ||
                (i.description && i.description.toLowerCase().includes(q)) ||
                i.hsnSac.includes(q)
            )
        );
      }
    }

    return list;
  }

  public getBillById(id: string): PurchaseBill | undefined {
    return this.bills.find((b) => b.id === id);
  }

  public getSummary(): {
    totalBills: number;
    totalQuantity: number;
    totalTaxable: number;
    totalGst: number;
    totalSpend: number;
  } {
    const list = this.bills;

    const totalBills = list.length;
    const totalQuantity = list.reduce((sum, b) => sum + b.totalQuantity, 0);
    const totalTaxable = list.reduce((sum, b) => sum + b.taxableAmount, 0);
    const totalGst = list.reduce((sum, b) => sum + b.gstAmount, 0);
    const totalSpend = list.reduce((sum, b) => sum + b.grandTotal, 0);

    return {
      totalBills,
      totalQuantity,
      totalTaxable,
      totalGst,
      totalSpend,
    };
  }

  public calculateBillTotals(items: { rate: number; quantity: number; taxRate: number }[]) {
    let totalQuantity = 0;
    let taxableAmount = 0;
    let gstAmount = 0;

    for (const item of items) {
      const lineTaxable = item.rate * item.quantity;
      const lineTax = (lineTaxable * item.taxRate) / 100;
      totalQuantity += item.quantity;
      taxableAmount += lineTaxable;
      gstAmount += lineTax;
    }

    const rawGrandTotal = taxableAmount + gstAmount;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));

    return {
      totalQuantity,
      taxableAmount: Number(taxableAmount.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      roundOff,
      grandTotal,
    };
  }

  public createBill(
    data: Omit<
      PurchaseBill,
      "id" | "createdAt" | "updatedAt" | "totalQuantity" | "taxableAmount" | "gstAmount" | "roundOff" | "grandTotal"
    >
  ): PurchaseBill {
    const totals = this.calculateBillTotals(data.items);

    const calculatedItems: PurchaseBillItem[] = data.items.map((i, idx) => {
      const taxable = i.rate * i.quantity;
      const tax = (taxable * i.taxRate) / 100;
      return {
        ...i,
        id: i.id || `pitem-${Date.now()}-${idx}`,
        taxableAmount: Number(taxable.toFixed(2)),
        taxAmount: Number(tax.toFixed(2)),
        amount: Number((taxable + tax).toFixed(2)),
      };
    });

    const newBill: PurchaseBill = {
      ...data,
      id: `bill-${crypto.randomUUID()}`,
      items: calculatedItems,
      totalQuantity: totals.totalQuantity,
      taxableAmount: totals.taxableAmount,
      gstAmount: totals.gstAmount,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      status: data.status || "Completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bills.unshift(newBill);

    // Auto-synchronize inventory: Add inward stock
    inventoryService.addPurchaseStock(
      newBill.items,
      newBill.supplierName,
      newBill.invoiceDate
    );

    this.notify();
    return newBill;
  }

  public updateBill(
    id: string,
    updates: Partial<Omit<PurchaseBill, "id" | "createdAt" | "updatedAt">>
  ): PurchaseBill {
    const idx = this.bills.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Bill ${id} not found`);

    const existing = this.bills[idx];

    // Revert prior stock from inventory before applying updated items
    if (updates.items) {
      inventoryService.revertPurchaseStock(existing.items);
    }

    let calculatedItems = existing.items;
    let totals = {
      totalQuantity: existing.totalQuantity,
      taxableAmount: existing.taxableAmount,
      gstAmount: existing.gstAmount,
      roundOff: existing.roundOff,
      grandTotal: existing.grandTotal,
    };

    if (updates.items) {
      totals = this.calculateBillTotals(updates.items);
      calculatedItems = updates.items.map((i, itemIdx) => {
        const taxable = i.rate * i.quantity;
        const tax = (taxable * i.taxRate) / 100;
        return {
          ...i,
          id: i.id || `pitem-${Date.now()}-${itemIdx}`,
          taxableAmount: Number(taxable.toFixed(2)),
          taxAmount: Number(tax.toFixed(2)),
          amount: Number((taxable + tax).toFixed(2)),
        };
      });
    }

    const updated: PurchaseBill = {
      ...existing,
      ...updates,
      items: calculatedItems,
      totalQuantity: totals.totalQuantity,
      taxableAmount: totals.taxableAmount,
      gstAmount: totals.gstAmount,
      roundOff: totals.roundOff,
      grandTotal: totals.grandTotal,
      updatedAt: new Date().toISOString(),
    };

    this.bills[idx] = updated;

    // Apply new items to inventory
    if (updates.items) {
      inventoryService.addPurchaseStock(
        updated.items,
        updated.supplierName,
        updated.invoiceDate
      );
    }

    this.notify();
    return updated;
  }

  public deleteBill(id: string): boolean {
    const idx = this.bills.findIndex((b) => b.id === id);
    if (idx === -1) return false;

    const targetBill = this.bills[idx];
    // Revert stock from inventory
    inventoryService.revertPurchaseStock(targetBill.items);

    this.bills.splice(idx, 1);
    this.notify();
    return true;
  }
}

export const purchaseHistoryService = new PurchaseHistoryService();
