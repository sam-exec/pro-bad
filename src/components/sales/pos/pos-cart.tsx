"use client";

import React, { useState } from "react";
import { CartItem, POSSalePayload, InvoiceDetails } from "@/types/products";
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Building,
  User,
  Phone,
  Receipt,
  Percent,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types/payment";

interface POSCartProps {
  cart: CartItem[];
  branchId: string;
  branchName: string;
  employeeId: string;
  employeeName: string;
  onUpdateQuantity: (variantId: string, qty: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
  onCheckout: (payload: POSSalePayload) => Promise<InvoiceDetails | void>;
}

export function POSCart({
  cart,
  branchId,
  branchName,
  employeeId,
  employeeName,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: POSCartProps) {
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxRate = taxEnabled ? 0.18 : 0;
  const taxAmount = discountedSubtotal * taxRate;
  const totalAmount = discountedSubtotal + taxAmount;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg("Your cart is empty. Please add products first.");
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg("Please enter customer name.");
      return;
    }
    if (!customerMobile.trim()) {
      setErrorMsg("Please enter customer mobile number.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const payload: POSSalePayload = {
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        items: [...cart],
        subtotal,
        discount: discountAmount,
        taxRate,
        taxAmount,
        totalAmount,
        paymentMethod,
        branchId,
        branchName,
        employeeId,
        employeeName,
      };

      await onCheckout(payload);
      setCustomerName("");
      setCustomerMobile("");
      setDiscountPercent(0);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      {/* Cart Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Sale</h3>
            <p className="text-[11px] text-slate-500">
              {totalItemsCount} unit{totalItemsCount !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[340px] min-h-[160px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <ShoppingCart className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">POS Cart is Empty</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Select a category, product, and variant on the left to add items.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.variantId}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.productName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white border border-slate-200 rounded text-slate-600">
                      {item.sku}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                    {item.modelName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {Object.entries(item.attributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" • ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.variantId)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60">
                <span className="text-xs font-extrabold text-slate-900">
                  ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    (₹{item.unitPrice.toFixed(2)}/ea)
                  </span>
                </span>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuantity(item.variantId, item.quantity - 1)
                    }
                    className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.maxStock}
                    onClick={() =>
                      onUpdateQuantity(item.variantId, item.quantity + 1)
                    }
                    className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200 text-xs disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Info Form & Payment */}
      <form onSubmit={handleCheckoutSubmit} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Customer Name *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                required
                placeholder="e.g. Sanjay Verma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
            Payment Mode:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "Cash", label: "Cash", icon: Banknote },
              { id: "UPI", label: "UPI", icon: QrCode },
            ].map(({ id, label, icon: Icon }) => {
              const isSelected = paymentMethod === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id as PaymentMethod)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 p-2 rounded-lg border text-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Discounts & Tax Toggles */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-semibold">Discount:</span>
            {[0, 5, 10].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiscountPercent(d)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer",
                  discountPercent === d
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                {d === 0 ? "None" : `${d}%`}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={taxEnabled}
              onChange={(e) => setTaxEnabled(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
            />
            <span>18% GST</span>
          </label>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount ({discountPercent}%)</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {taxEnabled && (
            <div className="flex justify-between text-slate-500">
              <span>GST (18%)</span>
              <span>+₹{taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
            <span>Total Payable</span>
            <span className="text-emerald-700 text-base">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={cart.length === 0 || isSubmitting}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Receipt className="w-4 h-4" />
              <span>Charge ₹{totalAmount.toFixed(2)} & Generate Invoice</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
