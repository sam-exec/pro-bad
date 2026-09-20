"use client";

import React from "react";
import { X, User, Calendar, CreditCard, Clock, Edit2 } from "lucide-react";
import { Student } from "@/types/kids-coaching";
import { StatusBadge } from "./status-badge";
import { PaymentBadge } from "./payment-badge";
import { PaymentMethodBadge } from "@/components/common/payment-method-badge";
import { Button } from "@/components/ui/button";

interface StudentDetailsDrawerProps {
  student: Student | null;
  serialNumber?: number;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export function StudentDetailsDrawer({
  student,
  serialNumber,
  isOpen,
  onClose,
  onEdit,
}: StudentDetailsDrawerProps) {
  if (!isOpen || !student) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
              {student.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {student.studentName}
                </h2>
                <StatusBadge status={student.status} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {serialNumber !== undefined ? `${serialNumber}` : student.studentId || "—"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Student Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <User className="w-4 h-4 text-blue-600" />
              <span>Student Information</span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Serial Number</span>
                <p className="font-semibold text-slate-800 font-mono mt-0.5">
                  {serialNumber !== undefined ? `${serialNumber}` : "—"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Student Name</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {student.studentName}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Parent Name</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {student.parentName}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Parent Phone</span>
                <p className="font-semibold text-slate-800 font-mono mt-0.5">
                  {student.mobileNumber}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Age</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {student.age} yrs
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Gender</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {student.gender}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Coaching Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Coaching Information</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs space-y-3">
              <div>
                <span className="text-slate-400 font-medium">Batch</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {student.batch}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-medium">Assigned Coach</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {student.coach}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Joining Date</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {student.joiningDate}
                  </p>
                </div>
              </div>
              {student.remarks && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 font-medium">Remarks / Notes</span>
                  <p className="text-slate-700 italic mt-0.5">
                    &quot;{student.remarks}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Fee Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Fee Information ({student.currentMonth} {student.year})</span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs text-center">
              <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-400 font-medium">Monthly Fee</span>
                <p className="text-base font-bold text-slate-900 mt-1">
                  ₹{student.monthlyFee}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-400 font-medium">Paid</span>
                <p className="text-base font-bold text-emerald-600 mt-1">
                  ₹{student.amountPaid}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                <span className="text-slate-400 font-medium">Due</span>
                <p className="text-base font-bold text-rose-600 mt-1">
                  ₹{student.dueAmount}
                </p>
              </div>
              <div className="col-span-3 pt-2 flex items-center justify-between border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Payment Method:</span>
                <PaymentMethodBadge method={student.paymentMethod} />
              </div>
              <div className="col-span-3 pt-1 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Payment Status:</span>
                <PaymentBadge status={student.paymentStatus} />
              </div>
            </div>
          </div>

          {/* Section 4: System Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>System & Audit Information</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs space-y-2 text-slate-500">
              <div className="flex justify-between">
                <span>Created By Employee:</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {student.createdBy}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Created Date:</span>
                <span className="font-semibold text-slate-700">
                  {new Date(student.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-semibold text-slate-700">
                  {new Date(student.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Modified By:</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {student.lastModifiedBy}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onClose();
              onEdit(student);
            }}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Student</span>
          </Button>
        </div>
      </div>
    </>
  );
}
