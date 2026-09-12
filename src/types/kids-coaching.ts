export type PaymentStatus = "Paid" | "Partial" | "Pending";
export type StudentStatus = "Active" | "Inactive" | "Trial";
export type Gender = "Male" | "Female" | "Other";

import { ExcelRecordMeta } from "./excel";

export interface Student extends ExcelRecordMeta {
  id: string;
  studentId: string; // e.g. KC-2026-001
  studentName: string;
  parentName: string;
  mobileNumber: string;
  age: number;
  gender: Gender;
  joiningDate: string; // YYYY-MM-DD
  batch: string;
  coach: string;
  monthlyFee: number;
  amountPaid: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  currentMonth: string; // e.g. "January", "February", "March", etc.
  year: number;
  status: StudentStatus;
  remarks?: string;

  // Synchronization and audit metadata for Central Database & Master Excel Workbook
  createdBy: string; // Employee ID
}

export type StudentFormData = Omit<
  Student,
  | "id"
  | "recordId"
  | "studentId"
  | "dueAmount"
  | "paymentStatus"
  | "branchId"
  | "branchName"
  | "employeeId"
  | "employeeName"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "lastModifiedBy"
> & {
  id?: string;
  recordId?: string;
  studentId?: string;
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const YEARS = [2026, 2025, 2024] as const;

export const BATCHES = [
  "Morning Batch A (06:00 AM - 07:30 AM)",
  "Morning Batch B (07:30 AM - 09:00 AM)",
  "Evening Batch A (04:30 PM - 06:00 PM)",
  "Evening Batch B (06:00 PM - 07:30 PM)",
  "Weekend Intensive (09:00 AM - 11:30 AM)",
] as const;

export const COACHES = [
  "Coach David Chen",
  "Coach Priya Sharma",
  "Coach Marcus Vance",
  "Coach Sunita Rao",
] as const;
