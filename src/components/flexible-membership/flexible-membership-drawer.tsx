"use client";

import React from "react";
import {
  X,
  User,
  Users,
  Calendar,
  Clock,
  Hourglass,
  Edit2,
  MapPin,
  Mail,
  Phone,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import {
  FlexibleMembershipRecord,
  calculateDaysRemaining,
} from "@/types/flexible-membership";
import { FlexibleStatusBadge } from "./flexible-status-badge";
import { HoursProgressBar } from "./hours-progress-bar";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { Button } from "@/components/ui/button";

interface FlexibleMembershipDrawerProps {
  membership: FlexibleMembershipRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: FlexibleMembershipRecord) => void;
}

export function FlexibleMembershipDrawer({
  membership,
  isOpen,
  onClose,
  onEdit,
}: FlexibleMembershipDrawerProps) {
  if (!isOpen || !membership) return null;

  const daysLeft = calculateDaysRemaining(membership.expiryDate);
  const totalMembers = 1 + (membership.additionalMembers?.length || 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-base">
              {membership.primaryMemberName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {membership.primaryMemberName}
                </h2>
                <FlexibleStatusBadge status={membership.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Serial No: #{membership.serialNumber} &bull; 30-Hour Package
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Session Summary & Visual Progress */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 text-blue-600" />
              <span>Session Summary & Utilization</span>
            </span>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
              {/* Progress Bar Component */}
              <HoursProgressBar
                totalHours={membership.totalHours}
                hoursUsed={membership.hoursUsed}
                size="lg"
              />

              {/* Stat breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <span className="text-slate-400">Total Hours</span>
                  <p className="text-base font-extrabold text-slate-800 mt-0.5">
                    {membership.totalHours}h
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <span className="text-slate-400">Hours Used</span>
                  <p className="text-base font-extrabold text-blue-600 mt-0.5">
                    {membership.hoursUsed}h
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                  <span className="text-slate-400">Remaining</span>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                    {membership.hoursRemaining}h
                  </p>
                </div>
              </div>

              {/* Days Remaining Banner */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200/80 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 font-medium">Days Remaining:</span>
                </div>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    daysLeft <= 0
                      ? "bg-rose-50 text-rose-700"
                      : daysLeft <= 7
                      ? "bg-amber-50 text-amber-700 animate-pulse"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {daysLeft <= 0
                    ? "Expired"
                    : `${daysLeft} Days Left (until ${membership.expiryDate})`}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Fee & Payment Details */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Fee & Payment Details</span>
            </span>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400">Package Fee</span>
                  <p className="font-semibold text-slate-800 font-mono mt-0.5">
                    ₹{(membership.planFee || 450).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Amount Paid</span>
                  <p className="font-bold text-emerald-600 font-mono mt-0.5">
                    ₹{(membership.amountPaid || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Due Amount</span>
                  <p
                    className={`font-bold font-mono mt-0.5 ${
                      (membership.dueAmount || 0) > 0 ? "text-rose-600" : "text-slate-700"
                    }`}
                  >
                    ₹{(membership.dueAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 items-center">
                <div>
                  <span className="text-slate-400 block mb-1">Payment Method</span>
                  <PaymentMethodBadge method={membership.paymentMethod} />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Payment Status</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      membership.paymentStatus === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : membership.paymentStatus === "Partial"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {membership.paymentStatus || "Paid"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Primary Member Info */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Primary Member (Package Owner)</span>
            </span>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Mobile Number</span>
                  <p className="font-semibold text-slate-800 font-mono mt-0.5">
                    {membership.primaryMobileNumber}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Email</span>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">
                    {membership.email || "—"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Address</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {membership.address}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400">Joining Date</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {membership.joiningDate}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Expiry Date (45 Days)</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {membership.expiryDate}
                  </p>
                </div>
              </div>

              {membership.remarks && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400">Remarks</span>
                  <p className="text-slate-700 italic mt-0.5">
                    &quot;{membership.remarks}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Additional Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Linked Members Sharing Package</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {membership.additionalMembers?.length || 0} Attached
              </span>
            </div>

            {(!membership.additionalMembers ||
              membership.additionalMembers.length === 0) ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No additional family members attached to this 30-hour package.
              </div>
            ) : (
              <div className="space-y-2.5">
                {membership.additionalMembers.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {m.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        ₹{m.individualContribution}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pl-7">
                      <span className="font-mono">{m.mobileNumber}</span>
                      <span className="text-[11px] text-slate-400">
                        Shares 30h bucket &bull; Expires {membership.expiryDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: System Information */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>System & Audit Information</span>
            </span>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-slate-500">
              <div className="flex justify-between">
                <span>Record ID:</span>
                <span className="font-mono font-medium text-slate-700">
                  {membership.recordId}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Employee:</span>
                <span className="text-slate-700 font-medium">
                  {membership.employeeName} ({membership.employeeId})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Created At:</span>
                <span className="text-slate-700 font-medium">
                  {new Date(membership.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="text-slate-700 font-medium">
                  {new Date(membership.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 flex items-center gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button
            onClick={() => {
              const toEdit = membership;
              onClose();
              onEdit(toEdit);
            }}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Membership</span>
          </Button>
        </div>
      </div>
    </>
  );
}
