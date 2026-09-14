/**
 * Common metadata that every record across all modules must contain for multi-branch isolation.
 * Automatically stamped using the logged-in employee session.
 */
export interface BranchRecordMeta {
  branchId: string; // e.g. "branch-nlg" or "branch-mnk"
  branchName: string; // e.g. "Nallagandla" or "Manikonda"
  employeeId: string; // e.g. "NLG004"
  employeeName: string; // e.g. "Rahul Sharma"
}

import { ExcelRecordMeta } from "./excel";
import { PaymentMethod, PaymentStatus } from "./payment";

/**
 * Sales Record schema mapped to Sales.xlsx -> Sales Worksheet
 */
export interface SalesRecord extends ExcelRecordMeta {
  id: string; // Identifier (maps to recordId)
  invoiceNumber: string;
  customerName: string;
  customerMobile: string;
  category: "Coaching" | "Membership" | "Court Booking" | "Merchandise";
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  createdBy: string;
}

/**
 * Super Moms Module Record schema mapped to Super Moms.xlsx -> Super Moms Worksheet
 */
export interface SuperMomsRecord extends ExcelRecordMeta {
  id: string; // Identifier (maps to recordId)
  serialNumber?: number;
  memberId?: string;
  memberName: string;
  mobileNumber: string;
  batch: string;
  coach: string;
  monthlyFee: number;
  amountPaid: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  joiningDate: string;
  status: "Active" | "Inactive";
  createdBy: string;
}
