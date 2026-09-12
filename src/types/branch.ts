import { Branch } from "@/config/branches";

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

/**
 * Future Sales Record schema incorporating branch data isolation
 */
export interface SalesRecord extends BranchRecordMeta {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerMobile: string;
  category: "Coaching" | "Membership" | "Court Booking" | "Merchandise";
  description: string;
  amount: number;
  paymentMethod: "UPI" | "Cash" | "Card" | "NetBanking";
  date: string;
  createdAt: string;
  createdBy: string;
}

/**
 * Future Super Moms Module Record schema incorporating branch data isolation
 */
export interface SuperMomsRecord extends BranchRecordMeta {
  id: string;
  memberId: string;
  memberName: string;
  mobileNumber: string;
  batch: string;
  coach: string;
  monthlyFee: number;
  amountPaid: number;
  dueAmount: number;
  joiningDate: string;
  status: "Active" | "Inactive" | "Trial";
  createdAt: string;
  createdBy: string;
}
