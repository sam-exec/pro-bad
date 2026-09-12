"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Clock, UserCheck, ShieldCheck } from "lucide-react";
import {
  FlexibleMembershipRecord,
  calculateExpiryDate,
  determineFlexibleStatus,
  FlexibleStatus,
} from "@/types/flexible-membership";
import { LinkedMember } from "@/types/membership";
import { AdditionalMemberCard } from "@/components/membership/additional-member-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FlexibleMembershipModalProps {
  isOpen: boolean;
  membershipToEdit: FlexibleMembershipRecord | null;
  onClose: () => void;
  onSave: (
    data: Partial<FlexibleMembershipRecord>,
    idToEdit?: string
  ) => void;
}

export function FlexibleMembershipModal({
  isOpen,
  membershipToEdit,
  onClose,
  onSave,
}: FlexibleMembershipModalProps) {
  const isEditMode = Boolean(membershipToEdit);

  // Section 1: Primary Member Fields
  const [primaryMemberName, setPrimaryMemberName] = useState("");
  const [primaryMobileNumber, setPrimaryMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [joiningDate, setJoiningDate] = useState("2026-03-01");
  const [expiryDate, setExpiryDate] = useState(calculateExpiryDate("2026-03-01"));
  const [totalHours, setTotalHours] = useState<number>(30);
  const [hoursUsed, setHoursUsed] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(450);
  const [status, setStatus] = useState<FlexibleStatus>("Active");
  const [remarks, setRemarks] = useState("");

  // Section 2: Additional Members
  const [additionalMembers, setAdditionalMembers] = useState<LinkedMember[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recalculate expiry when joiningDate changes
  const handleJoiningDateChange = (newDate: string) => {
    setJoiningDate(newDate);
    const newExpiry = calculateExpiryDate(newDate, 45);
    setExpiryDate(newExpiry);
  };

  useEffect(() => {
    if (membershipToEdit) {
      setPrimaryMemberName(membershipToEdit.primaryMemberName);
      setPrimaryMobileNumber(membershipToEdit.primaryMobileNumber);
      setEmail(membershipToEdit.email || "");
      setAddress(membershipToEdit.address);
      setJoiningDate(membershipToEdit.joiningDate);
      setExpiryDate(membershipToEdit.expiryDate);
      setTotalHours(membershipToEdit.totalHours || 30);
      setHoursUsed(membershipToEdit.hoursUsed || 0);
      setAmountPaid(membershipToEdit.amountPaid || 450);
      setStatus(membershipToEdit.status);
      setRemarks(membershipToEdit.remarks || "");
      setAdditionalMembers(membershipToEdit.additionalMembers || []);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setPrimaryMemberName("");
      setPrimaryMobileNumber("");
      setEmail("");
      setAddress("");
      setJoiningDate(today);
      setExpiryDate(calculateExpiryDate(today, 45));
      setTotalHours(30);
      setHoursUsed(0);
      setAmountPaid(450);
      setStatus("Active");
      setRemarks("");
      setAdditionalMembers([]);
    }
    setErrors({});
  }, [membershipToEdit, isOpen]);

  if (!isOpen) return null;

  // Add Member handler
  const handleAddAdditionalMember = () => {
    const newIdx = additionalMembers.length + 1;
    const newMember: LinkedMember = {
      id: `flx-m-${Date.now()}-${newIdx}`,
      memberId: `FLX-M-${String(newIdx).padStart(3, "0")}`,
      name: "",
      mobileNumber: "",
      individualContribution: 0,
    };
    setAdditionalMembers((prev) => [...prev, newMember]);
  };

  const handleRemoveAdditionalMember = (id: string) => {
    setAdditionalMembers((prev) => prev.filter((m) => m.id !== id));
  };

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
      newErrors.primaryMobileNumber = "Enter a valid 10-digit mobile number.";
    }
    if (!address.trim()) {
      newErrors.address = "Address is required.";
    }
    if (hoursUsed < 0 || hoursUsed > totalHours) {
      newErrors.hoursUsed = `Hours used must be between 0 and ${totalHours}.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const computedRemaining = Math.max(0, totalHours - hoursUsed);
    const computedStatus = determineFlexibleStatus(
      totalHours,
      hoursUsed,
      expiryDate
    );

    const payload: Partial<FlexibleMembershipRecord> = {
      primaryMemberName: primaryMemberName.trim(),
      primaryMobileNumber: primaryMobileNumber.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      joiningDate,
      expiryDate,
      totalHours,
      hoursUsed,
      hoursRemaining: computedRemaining,
      amountPaid: Number(amountPaid),
      status: computedStatus,
      remarks: remarks.trim() || undefined,
      additionalMembers,
    };

    onSave(payload, membershipToEdit?.id);
    onClose();
  };

  const hoursRemaining = Math.max(0, totalHours - hoursUsed);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:w-full sm:max-w-3xl z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditMode ? "Edit Flexible Membership" : "Add Flexible 30h Membership"}
              </h2>
              <p className="text-xs text-slate-500">
                30 Coaching Hours Package &bull; 45 Days Validity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* SECTION 1: Primary Member */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Section 1: Primary Member & Package</span>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                30h / 45-Day Package
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flxPriName" required>
                  Primary Member Name
                </Label>
                <Input
                  id="flxPriName"
                  value={primaryMemberName}
                  onChange={(e) => setPrimaryMemberName(e.target.value)}
                  placeholder="e.g. Sameer Varma"
                  hasError={Boolean(errors.primaryMemberName)}
                />
                {errors.primaryMemberName && (
                  <p className="text-xs text-red-600">{errors.primaryMemberName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="flxPriMobile" required>
                  Mobile Number
                </Label>
                <Input
                  id="flxPriMobile"
                  value={primaryMobileNumber}
                  onChange={(e) => setPrimaryMobileNumber(e.target.value)}
                  placeholder="e.g. 9876599001"
                  maxLength={10}
                  hasError={Boolean(errors.primaryMobileNumber)}
                />
                {errors.primaryMobileNumber && (
                  <p className="text-xs text-red-600">{errors.primaryMobileNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="flxEmail">Email (Optional)</Label>
                <Input
                  id="flxEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sameer@example.com"
                />
              </div>

              <div>
                <Label htmlFor="flxAddr" required>
                  Address
                </Label>
                <Input
                  id="flxAddr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 24 Palm Grove Road, Koramangala"
                  hasError={Boolean(errors.address)}
                />
                {errors.address && (
                  <p className="text-xs text-red-600">{errors.address}</p>
                )}
              </div>

              {/* Joining Date */}
              <div>
                <Label htmlFor="flxJoin" required>
                  Joining Date
                </Label>
                <Input
                  id="flxJoin"
                  type="date"
                  value={joiningDate}
                  onChange={(e) => handleJoiningDateChange(e.target.value)}
                />
              </div>

              {/* Expiry Date (Auto-calculated, read-only) */}
              <div>
                <Label htmlFor="flxExpiry">
                  Expiry Date (Auto: +45 Days)
                </Label>
                <Input
                  id="flxExpiry"
                  type="date"
                  value={expiryDate}
                  readOnly
                  disabled
                  className="bg-slate-100/90 text-slate-700 font-semibold cursor-not-allowed"
                  title="Automatically calculated as Joining Date + 45 Days"
                />
              </div>

              {/* Total Hours (Fixed 30) */}
              <div>
                <Label htmlFor="flxHours">
                  Total Coaching Hours
                </Label>
                <Input
                  id="flxHours"
                  type="number"
                  value={totalHours}
                  readOnly
                  disabled
                  className="bg-slate-100/90 text-slate-700 font-bold cursor-not-allowed"
                />
              </div>

              {/* Hours Used (Edit / Set) */}
              <div>
                <Label htmlFor="flxUsed" required>
                  Hours Used (out of {totalHours})
                </Label>
                <Input
                  id="flxUsed"
                  type="number"
                  min={0}
                  max={totalHours}
                  value={hoursUsed}
                  onChange={(e) => setHoursUsed(Number(e.target.value))}
                  hasError={Boolean(errors.hoursUsed)}
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Remaining: <strong>{hoursRemaining} Hours</strong>
                </span>
                {errors.hoursUsed && (
                  <p className="text-xs text-red-600">{errors.hoursUsed}</p>
                )}
              </div>

              <div>
                <Label htmlFor="flxPaid" required>
                  Amount Paid (₹)
                </Label>
                <Input
                  id="flxPaid"
                  type="number"
                  min={0}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="flxStatus">
                  Status
                </Label>
                <select
                  id="flxStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FlexibleStatus)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800"
                >
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                  <option value="Completed">Completed (30 Hours Used)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="flxRem">Remarks</Label>
                <Input
                  id="flxRem"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Booking preference, coach request, etc."
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
                  Linked family members share the 30-hour bucket, joining date, and 45-day validity.
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
              <div className="p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                <p className="text-xs text-slate-500">
                  No additional members attached. Click <strong>+ Add Member</strong> to share this 30-hour package with family members.
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
              {isEditMode ? "Update Flexible Membership" : "Save Flexible Membership"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
