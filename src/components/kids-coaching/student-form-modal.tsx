"use client";

import React, { useState, useEffect } from "react";
import { X, User, DollarSign, Calendar, Info } from "lucide-react";
import {
  Student,
  StudentFormData,
  BATCHES,
  COACHES,
  MONTHS,
  Gender,
  StudentStatus,
} from "@/types/kids-coaching";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentBadge } from "./payment-badge";

interface StudentFormModalProps {
  isOpen: boolean;
  studentToEdit: Student | null;
  onClose: () => void;
  onSave: (formData: StudentFormData, studentId?: string) => void;
}

export function StudentFormModal({
  isOpen,
  studentToEdit,
  onClose,
  onSave,
}: StudentFormModalProps) {
  const isEditMode = Boolean(studentToEdit);

  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [age, setAge] = useState<number>(8);
  const [gender, setGender] = useState<Gender>("Male");
  const [joiningDate, setJoiningDate] = useState("2026-03-01");
  const [batch, setBatch] = useState<string>(BATCHES[0]);
  const [coach, setCoach] = useState<string>(COACHES[0]);
  const [monthlyFee, setMonthlyFee] = useState<number>(150);
  const [amountPaid, setAmountPaid] = useState<number>(150);
  const [currentMonth, setCurrentMonth] = useState<string>("March");
  const [year, setYear] = useState<number>(2026);
  const [status, setStatus] = useState<StudentStatus>("Active");
  const [remarks, setRemarks] = useState("");

  const [errors, setErrors] = useState<{
    studentName?: string;
    parentName?: string;
    mobileNumber?: string;
    age?: string;
    monthlyFee?: string;
  }>({});

  // Synchronize when opening for edit or new
  useEffect(() => {
    if (studentToEdit) {
      setStudentName(studentToEdit.studentName);
      setParentName(studentToEdit.parentName);
      setMobileNumber(studentToEdit.mobileNumber);
      setAge(studentToEdit.age);
      setGender(studentToEdit.gender);
      setJoiningDate(studentToEdit.joiningDate);
      setBatch(studentToEdit.batch);
      setCoach(studentToEdit.coach);
      setMonthlyFee(studentToEdit.monthlyFee);
      setAmountPaid(studentToEdit.amountPaid);
      setCurrentMonth(studentToEdit.currentMonth);
      setYear(studentToEdit.year);
      setStatus(studentToEdit.status);
      setRemarks(studentToEdit.remarks || "");
    } else {
      setStudentName("");
      setParentName("");
      setMobileNumber("");
      setAge(9);
      setGender("Male");
      setJoiningDate(new Date().toISOString().split("T")[0]);
      setBatch(BATCHES[0]);
      setCoach(COACHES[0]);
      setMonthlyFee(150);
      setAmountPaid(150);
      setCurrentMonth("March");
      setYear(2026);
      setStatus("Active");
      setRemarks("");
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  // Live calculations
  const calculatedDue = Math.max(0, monthlyFee - amountPaid);
  const computedPaymentStatus =
    calculatedDue === 0 && amountPaid > 0
      ? "Paid"
      : amountPaid > 0 && calculatedDue > 0
      ? "Partial"
      : "Pending";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!studentName.trim()) newErrors.studentName = "Student name is required.";
    if (!parentName.trim()) newErrors.parentName = "Parent name is required.";
    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = "Parent mobile number is required.";
    } else if (!/^\d{10}$/.test(mobileNumber.replace(/\D/g, ""))) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }
    if (age <= 0) newErrors.age = "Enter a valid age.";
    if (monthlyFee < 0) newErrors.monthlyFee = "Monthly fee cannot be negative.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: StudentFormData = {
      studentName: studentName.trim(),
      parentName: parentName.trim(),
      mobileNumber: mobileNumber.trim(),
      age: Number(age),
      gender,
      joiningDate,
      batch,
      coach,
      monthlyFee: Number(monthlyFee),
      amountPaid: Number(amountPaid),
      currentMonth,
      year: Number(year),
      status,
      remarks: remarks.trim(),
    };

    onSave(payload, studentToEdit?.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:w-full sm:max-w-2xl z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditMode ? "Edit Student Record" : "Add New Student"}
              </h2>
              <p className="text-xs text-slate-500">
                Kids Coaching student management & billing
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: Personal Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Personal Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Name */}
              <div className="space-y-1">
                <Label htmlFor="studentName" required>
                  Student Name
                </Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  hasError={Boolean(errors.studentName)}
                />
                {errors.studentName && (
                  <p className="text-xs text-red-600">{errors.studentName}</p>
                )}
              </div>

              {/* Parent Name */}
              <div className="space-y-1">
                <Label htmlFor="parentName" required>
                  Parent Name
                </Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Vikram Patel"
                  hasError={Boolean(errors.parentName)}
                />
                {errors.parentName && (
                  <p className="text-xs text-red-600">{errors.parentName}</p>
                )}
              </div>

              {/* Parent Mobile Number */}
              <div className="space-y-1">
                <Label htmlFor="mobileNumber" required>
                  Parent Mobile Number
                </Label>
                <Input
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  hasError={Boolean(errors.mobileNumber)}
                />
                {errors.mobileNumber && (
                  <p className="text-xs text-red-600">{errors.mobileNumber}</p>
                )}
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="age" required>
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min={4}
                    max={17}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    hasError={Boolean(errors.age)}
                  />
                  {errors.age && (
                    <p className="text-xs text-red-600">{errors.age}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="gender" required>
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Coaching Configuration */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Coaching Schedule & Status</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batch */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="batch" required>
                  Assigned Batch
                </Label>
                <select
                  id="batch"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {BATCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coach */}
              <div className="space-y-1">
                <Label htmlFor="coach" required>
                  Assigned Coach
                </Label>
                <select
                  id="coach"
                  value={coach}
                  onChange={(e) => setCoach(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  {COACHES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Joining Date */}
              <div className="space-y-1">
                <Label htmlFor="joiningDate" required>
                  Joining Date
                </Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                />
              </div>

              {/* Status */}
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="status" required>
                  Enrollment Status
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StudentStatus)}
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="Trial">Trial</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Fee & Billing */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
              <span>Fee & Billing</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-1">
                <Label htmlFor="monthlyFee" required>
                  Monthly Fee (₹)
                </Label>
                <Input
                  id="monthlyFee"
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

              <div className="space-y-1">
                <Label htmlFor="amountPaid" required>
                  Amount Paid (₹)
                </Label>
                <Input
                  id="amountPaid"
                  type="number"
                  min={0}
                  max={monthlyFee}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 select-none block">
                  Due Amount
                </span>
                <div className="h-11 px-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    ₹{calculatedDue}
                  </span>
                  <PaymentBadge status={computedPaymentStatus} />
                </div>
              </div>

              <div className="sm:col-span-3 grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label htmlFor="currentMonth">Billing Month</Label>
                  <select
                    id="currentMonth"
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 mt-1"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="year">Billing Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="h-10 text-xs mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Remarks */}
          <div className="space-y-1">
            <Label htmlFor="remarks">Remarks / Internal Notes</Label>
            <textarea
              id="remarks"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Trial progress notes, discount approvals, or parent requests"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none shadow-xs"
            />
          </div>

          {/* Footer inside form */}
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
              {isEditMode ? "Update Student" : "Save Student"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
