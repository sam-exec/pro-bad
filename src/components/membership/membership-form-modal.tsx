"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, UserCheck, ShieldCheck, Users } from "lucide-react";
import {
  MembershipRecord,
  LinkedMember,
  MEMBERSHIP_PLANS,
} from "@/types/membership";
import { MONTHS, StudentStatus } from "@/types/kids-coaching";
import { PaymentMethod } from "@/types/payment";
import { AdditionalMemberCard } from "./additional-member-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MembershipFormModalProps {
  isOpen: boolean;
  membershipToEdit: MembershipRecord | null;
  onClose: () => void;
  onSave: (record: Partial<MembershipRecord>, idToEdit?: string) => void;
}

export function MembershipFormModal({
  isOpen,
  membershipToEdit,
  onClose,
  onSave,
}: MembershipFormModalProps) {
  const isEditMode = Boolean(membershipToEdit);

  // Primary Member Fields
  const [primaryMemberName, setPrimaryMemberName] = useState("");
  const [primaryMobileNumber, setPrimaryMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [membershipPlan, setMembershipPlan] = useState<string>(MEMBERSHIP_PLANS[0]);
  const [joiningDate, setJoiningDate] = useState("2026-01-01");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");
  const [monthlyFee, setMonthlyFee] = useState<number>(600);
  const [amountPaid, setAmountPaid] = useState<number>(600);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [currentMonth, setCurrentMonth] = useState<string>("March");
  const [status, setStatus] = useState<StudentStatus>("Active");
  const [remarks, setRemarks] = useState("");

  // Additional Members (Section 2)
  const [additionalMembers, setAdditionalMembers] = useState<LinkedMember[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (membershipToEdit) {
      setPrimaryMemberName(membershipToEdit.primaryMemberName);
      setPrimaryMobileNumber(membershipToEdit.primaryMobileNumber);
      setEmail(membershipToEdit.email || "");
      setAddress(membershipToEdit.address);
      setMembershipPlan(membershipToEdit.membershipPlan);
      setJoiningDate(membershipToEdit.joiningDate);
      setExpiryDate(membershipToEdit.expiryDate);
      setMonthlyFee(membershipToEdit.monthlyFee);
      setAmountPaid(membershipToEdit.amountPaid);
      setPaymentMethod(membershipToEdit.paymentMethod || "UPI");
      setCurrentMonth(membershipToEdit.currentMonth);
      setStatus(membershipToEdit.status);
      setRemarks(membershipToEdit.remarks || "");
      setAdditionalMembers(membershipToEdit.additionalMembers || []);
    } else {
      setPrimaryMemberName("");
      setPrimaryMobileNumber("");
      setEmail("");
      setAddress("");
      setMembershipPlan(MEMBERSHIP_PLANS[1]);
      setJoiningDate("2026-01-01");
      setExpiryDate("2026-12-31");
      setMonthlyFee(600);
      setAmountPaid(600);
      setPaymentMethod("UPI");
      setCurrentMonth("March");
      setStatus("Active");
      setRemarks("");
      setAdditionalMembers([]);
    }
    setErrors({});
  }, [membershipToEdit, isOpen]);

  if (!isOpen) return null;

  // Add Additional Member
  const handleAddAdditionalMember = () => {
    const newIdx = additionalMembers.length + 1;
    const newMember: LinkedMember = {
      id: `lm-${Date.now()}-${newIdx}`,
      memberId: `LM-${String(newIdx).padStart(3, "0")}`,
      name: "",
      mobileNumber: "",
      individualContribution: 0,
    };
    setAdditionalMembers((prev) => [...prev, newMember]);
  };

  // Remove Additional Member
  const handleRemoveAdditionalMember = (id: string) => {
    setAdditionalMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Update Additional Member
  const handleUpdateAdditionalMember = (updated: LinkedMember) => {
    setAdditionalMembers((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!primaryMemberName.trim()) {
      newErrors.primaryMemberName = "Primary member name is required.";
    }
    if (
      !primaryMobileNumber.trim() ||
      !/^\d{10}$/.test(primaryMobileNumber.replace(/\D/g, ""))
    ) {
      newErrors.primaryMobileNumber = "Enter a valid 10-digit primary mobile.";
    }
    if (!address.trim()) {
      newErrors.address = "Address is required.";
    }
    if (monthlyFee < 0) {
      newErrors.monthlyFee = "Fee cannot be negative.";
    }
    if (amountPaid > 0 && !paymentMethod) {
      newErrors.paymentMethod = "Payment method is required when amount paid > 0.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dueAmount = Math.max(0, monthlyFee - amountPaid);
    const paymentStatus =
      dueAmount === 0 && amountPaid > 0
        ? "Paid"
        : amountPaid > 0 && dueAmount > 0
        ? "Partial"
        : "Pending";

    const payload: Partial<MembershipRecord> = {
      primaryMemberName: primaryMemberName.trim(),
      primaryMobileNumber: primaryMobileNumber.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      membershipPlan,
      joiningDate,
      expiryDate,
      monthlyFee: Number(monthlyFee),
      amountPaid: Number(amountPaid),
      dueAmount,
      paymentStatus,
      paymentMethod,
      status,
      currentMonth,
      remarks: remarks.trim() || undefined,
      additionalMembers,
    };

    onSave(payload, membershipToEdit?.id);
    onClose();
  };

  const totalMembersCount = 1 + additionalMembers.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:w-full sm:max-w-3xl z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditMode ? "Edit Membership & Family" : "Add New Membership"}
              </h2>
              <p className="text-xs text-slate-500">
                Primary member details and attached family/group members ({totalMembersCount} total)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* SECTION 1: Primary Member */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Section 1: Primary Member Details</span>
              </div>
              <span className="text-[11px] text-slate-400">Account Owner</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Name */}
              <div>
                <Label htmlFor="priName" required>
                  Primary Member Name
                </Label>
                <Input
                  id="priName"
                  value={primaryMemberName}
                  onChange={(e) => setPrimaryMemberName(e.target.value)}
                  placeholder="e.g. John Smith"
                  hasError={Boolean(errors.primaryMemberName)}
                />
                {errors.primaryMemberName && (
                  <p className="text-xs text-red-600">{errors.primaryMemberName}</p>
                )}
              </div>

              {/* Primary Mobile */}
              <div>
                <Label htmlFor="priMobile" required>
                  Mobile Number
                </Label>
                <Input
                  id="priMobile"
                  value={primaryMobileNumber}
                  onChange={(e) => setPrimaryMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  hasError={Boolean(errors.primaryMobileNumber)}
                />
                {errors.primaryMobileNumber && (
                  <p className="text-xs text-red-600">{errors.primaryMobileNumber}</p>
                )}
              </div>

              {/* Email (Optional) */}
              <div>
                <Label htmlFor="priEmail">Email Address (Optional)</Label>
                <Input
                  id="priEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john.smith@example.com"
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="priAddr" required>
                  Residential Address
                </Label>
                <Input
                  id="priAddr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 42 Parkside Boulevard, Apt 4B"
                  hasError={Boolean(errors.address)}
                />
                {errors.address && (
                  <p className="text-xs text-red-600">{errors.address}</p>
                )}
              </div>

              {/* Plan */}
              <div className="sm:col-span-2">
                <Label htmlFor="priPlan" required>
                  Membership Plan
                </Label>
                <select
                  id="priPlan"
                  value={membershipPlan}
                  onChange={(e) => setMembershipPlan(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {MEMBERSHIP_PLANS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Joining & Expiry Dates */}
              <div>
                <Label htmlFor="priJoin" required>
                  Joining Date
                </Label>
                <Input
                  id="priJoin"
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="priExpiry" required>
                  Expiry Date
                </Label>
                <Input
                  id="priExpiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              {/* Fee & Paid */}
              <div>
                <Label htmlFor="priFee" required>
                  Total Fee (₹)
                </Label>
                <Input
                  id="priFee"
                  type="number"
                  min={0}
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  hasError={Boolean(errors.monthlyFee)}
                />
                {errors.monthlyFee && (
                  <p className="text-xs text-red-600">{errors.monthlyFee}</p>
                )}
              </div>

              <div>
                <Label htmlFor="priPaid" required>
                  Amount Paid (₹)
                </Label>
                <Input
                  id="priPaid"
                  type="number"
                  min={0}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="priMethod" required={amountPaid > 0}>
                  Payment Method
                </Label>
                <select
                  id="priMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
                {errors.paymentMethod && (
                  <p className="text-xs text-red-600">{errors.paymentMethod}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="priStatus" required>
                  Membership Status
                </Label>
                <select
                  id="priStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StudentStatus)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Billing Month */}
              <div>
                <Label htmlFor="priMonth">Billing Month</Label>
                <select
                  id="priMonth"
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remarks */}
              <div className="sm:col-span-2">
                <Label htmlFor="priRem">Remarks</Label>
                <Input
                  id="priRem"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Family notes, court access privileges..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Additional Members */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Section 2: Additional Members</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Attached members automatically inherit Plan, Joining Date, Expiry Date, and Status.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAdditionalMember}
                className="gap-1.5 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </Button>
            </div>

            {additionalMembers.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                <p className="text-xs text-slate-500">
                  No additional family members attached yet. Click <strong>+ Add Member</strong> to include family or group members.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {additionalMembers.map((member, idx) => (
                  <AdditionalMemberCard
                    key={member.id}
                    index={idx}
                    member={member}
                    onChange={handleUpdateAdditionalMember}
                    onRemove={() => handleRemoveAdditionalMember(member.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isEditMode ? "Update Membership" : "Save Membership"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
