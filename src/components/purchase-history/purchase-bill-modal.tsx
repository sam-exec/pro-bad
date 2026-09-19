"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, Receipt, Calculator, Building2 } from "lucide-react";
import {
  PurchaseBill,
  PurchaseBillItem,
  GST_TAX_RATES,
  PRODUCT_UNITS,
} from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PurchaseBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (billData: any, idToEdit?: string) => void;
  billToEdit?: PurchaseBill | null;
  isAdmin?: boolean;
}

interface ItemRowState {
  id: string;
  productName: string;
  description: string;
  hsnSac: string;
  taxRate: number;
  quantity: number | string;
  unit: string;
  rate: number | string;
}

export function PurchaseBillModal({
  isOpen,
  onClose,
  onSave,
  billToEdit,
  isAdmin = false,
}: PurchaseBillModalProps) {
  const [supplierName, setSupplierName] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [placeOfSupply, setPlaceOfSupply] = useState("Telangana (36)");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"Completed" | "Pending" | "Verified">("Verified");

  const [items, setItems] = useState<ItemRowState[]>([
    {
      id: crypto.randomUUID(),
      productName: "",
      description: "",
      hsnSac: "95069990",
      taxRate: 18,
      quantity: 1,
      unit: "Pcs",
      rate: 0,
    },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (billToEdit) {
      setSupplierName(billToEdit.supplierName);
      setSupplierAddress(billToEdit.supplierAddress || "");
      setGstNumber(billToEdit.gstNumber || "");
      setPanNumber(billToEdit.panNumber || "");
      setPhoneNumber(billToEdit.phoneNumber || "");
      setInvoiceNumber(billToEdit.invoiceNumber);
      setInvoiceDate(billToEdit.invoiceDate);
      setPlaceOfSupply(billToEdit.placeOfSupply || "Telangana (36)");
      setNotes(billToEdit.notes || "");
      setStatus(billToEdit.status || "Verified");
      setItems(
        billToEdit.items.map((i) => ({
          id: i.id || crypto.randomUUID(),
          productName: i.productName,
          description: i.description || "",
          hsnSac: i.hsnSac || "95069990",
          taxRate: i.taxRate || 18,
          quantity: i.quantity,
          unit: i.unit || "Pcs",
          rate: i.rate,
        }))
      );
    } else {
      setSupplierName("");
      setSupplierAddress("");
      setGstNumber("");
      setPanNumber("");
      setPhoneNumber("");
      setInvoiceNumber("");
      setInvoiceDate(new Date().toISOString().split("T")[0]);
      setPlaceOfSupply("Telangana (36)");
      setNotes("");
      setStatus("Verified");
      setItems([
        {
          id: crypto.randomUUID(),
          productName: "",
          description: "",
          hsnSac: "95069990",
          taxRate: 18,
          quantity: 1,
          unit: "Pcs",
          rate: 0,
        },
      ]);
    }
    setErrorMsg(null);
  }, [billToEdit, isOpen]);

  if (!isOpen) return null;

  // Auto Calculations for each item and bill
  let totalQty = 0;
  let taxableTotal = 0;
  let gstTotal = 0;

  const computedItems = items.map((item) => {
    const q = Number(item.quantity) || 0;
    const r = Number(item.rate) || 0;
    const t = Number(item.taxRate) || 0;
    const taxable = Math.round(q * r * 100) / 100;
    const tax = Math.round(((taxable * t) / 100) * 100) / 100;
    const rowTotal = Math.round((taxable + tax) * 100) / 100;

    totalQty += q;
    taxableTotal += taxable;
    gstTotal += tax;

    return { ...item, taxable, tax, rowTotal };
  });

  taxableTotal = Math.round(taxableTotal * 100) / 100;
  gstTotal = Math.round(gstTotal * 100) / 100;
  const rawTotal = taxableTotal + gstTotal;
  const grandTotal = Math.round(rawTotal);
  const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productName: "",
        description: "",
        hsnSac: "95069990",
        taxRate: 18,
        quantity: 1,
        unit: "Pcs",
        rate: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemRowState, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!supplierName.trim()) {
      setErrorMsg("Supplier Name is required.");
      return;
    }
    if (!invoiceNumber.trim()) {
      setErrorMsg("Invoice Number is required.");
      return;
    }
    if (items.some((i) => !i.productName.trim())) {
      setErrorMsg("All items must have a Product Name.");
      return;
    }
    if (items.some((i) => Number(i.quantity) <= 0)) {
      setErrorMsg("Quantity must be greater than 0 for all items.");
      return;
    }
    if (items.some((i) => Number(i.rate) < 0)) {
      setErrorMsg("Rate cannot be negative.");
      return;
    }

    const payload = {
      supplierName: supplierName.trim(),
      supplierAddress: supplierAddress.trim(),
      gstNumber: gstNumber.trim().toUpperCase(),
      panNumber: panNumber.trim().toUpperCase(),
      phoneNumber: phoneNumber.trim(),
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      placeOfSupply: placeOfSupply.trim(),
      notes: notes.trim(),
      status,
      items: items.map((i) => ({
        productName: i.productName.trim(),
        description: i.description.trim(),
        hsnSac: i.hsnSac.trim() || "95069990",
        taxRate: Number(i.taxRate) || 0,
        quantity: Number(i.quantity) || 1,
        unit: i.unit || "Pcs",
        rate: Number(i.rate) || 0,
      })),
    };

    onSave(payload, billToEdit?.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-8 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {billToEdit ? "Edit Purchase Bill" : "Add Purchase Bill"}
              </h2>
              <p className="text-xs text-slate-500">
                Record supplier invoice details & auto-update warehouse inventory.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* SECTION 1: Supplier & Bill Metadata */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <span className="font-bold uppercase tracking-wider text-slate-500 text-[11px] block">
              1. Supplier &amp; Invoice Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Supplier Name *</Label>
                <Input
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Sunrise Sports India Pvt Ltd"
                  required
                  className="h-9 mt-1 text-xs bg-white"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Invoice Number *</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. SSI/2026/03/0142"
                  required
                  className="h-9 mt-1 text-xs bg-white font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Invoice Date *</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                  className="h-9 mt-1 text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs font-semibold">GSTIN</Label>
                <Input
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="36AABCS1429B1Z2"
                  className="h-9 mt-1 text-xs bg-white font-mono uppercase"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">PAN Number</Label>
                <Input
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  placeholder="AABCS1429B"
                  className="h-9 mt-1 text-xs bg-white font-mono uppercase"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98490 12345"
                  className="h-9 mt-1 text-xs bg-white font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Place of Supply</Label>
                <Input
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  placeholder="Telangana (36)"
                  className="h-9 mt-1 text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Supplier Address</Label>
              <Input
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                placeholder="e.g. Plot No. 42, IDA Cherlapally, Hyderabad, Telangana 500051"
                className="h-9 mt-1 text-xs bg-white"
              />
            </div>
          </div>

          {/* SECTION 2: Purchase Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                2. Purchase Items ({items.length} Product{items.length !== 1 ? "s" : ""})
              </span>
              <Button
                type="button"
                onClick={handleAddItem}
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3 min-w-[180px]">Product Name *</th>
                    <th className="py-2.5 px-3 min-w-[120px]">Description</th>
                    <th className="py-2.5 px-3 w-28">HSN/SAC</th>
                    <th className="py-2.5 px-3 w-24">Tax %</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty *</th>
                    <th className="py-2.5 px-3 w-24">Unit</th>
                    <th className="py-2.5 px-3 w-28 text-right">Rate (₹) *</th>
                    <th className="py-2.5 px-3 w-32 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {computedItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <Input
                          value={item.productName}
                          onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                          placeholder="e.g. Yonex Astrox 100ZZ"
                          required
                          className="h-8 text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          placeholder="Optional spec"
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={item.hsnSac}
                          onChange={(e) => handleItemChange(idx, "hsnSac", e.target.value)}
                          placeholder="95069990"
                          className="h-8 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(idx, "taxRate", Number(e.target.value))}
                          className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs bg-white font-medium"
                        >
                          {GST_TAX_RATES.map((rate) => (
                            <option key={rate} value={rate}>
                              {rate}% GST
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          required
                          className="h-8 text-xs text-center font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                          className="h-8 w-full rounded-md border border-slate-200 px-1.5 text-xs bg-white"
                        >
                          {PRODUCT_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                          required
                          className="h-8 text-xs text-right font-bold font-mono"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900 font-mono">
                        ₹{item.rowTotal.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: Auto-Calculated Summary Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                Quantity Total
              </span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">
                {totalQty} units
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                Taxable Amount
              </span>
              <span className="text-base font-black text-slate-900 mt-0.5 block font-mono">
                ₹{taxableTotal.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                GST Amount
              </span>
              <span className="text-base font-black text-indigo-700 mt-0.5 block font-mono">
                ₹{gstTotal.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                Round Off
              </span>
              <span className="text-base font-bold text-slate-600 mt-0.5 block font-mono">
                {roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}
              </span>
            </div>
            <div>
              <span className="text-emerald-700 font-bold block uppercase text-[10px]">
                Grand Total (₹)
              </span>
              <span className="text-xl font-black text-emerald-700 mt-0.5 block font-mono">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-semibold">Notes / Reference (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Delivery Challan Ref #8841, payment terms 30 days"
              className="h-9 mt-1 text-xs bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
            >
              {billToEdit ? "Update Purchase Bill" : "Save & Add to Inventory"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
