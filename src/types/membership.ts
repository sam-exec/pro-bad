import { PaymentStatus, StudentStatus, PaymentMethod } from "./kids-coaching";
import { AuditMetadata } from "./coaching-modules";

export interface LinkedMember {
  id: string;
  memberId: string; // e.g. LM-001
  name: string;
  mobileNumber: string;
  individualContribution: number | "";
}

export interface MembershipRecord extends AuditMetadata {
  id: string;
  serialNumber: number; // Auto-generated, read-only permanent identifier (1, 2, 3...)
  membershipId?: string; // Kept optional for legacy Excel mapping
  primaryMemberName: string;
  primaryMobileNumber: string;
  email?: string;
  address: string;
  membershipPlan: "1 Month" | "3 Months" | "6 Months" | string;
  joiningDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  monthlyFee: number;
  amountPaid: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod; // Cash | UPI
  status: StudentStatus; // "Active" | "Inactive" only
  remarks?: string;
  currentMonth: string;
  year: number;
  additionalMembers: LinkedMember[];
}

export const MEMBERSHIP_PLANS = [
  "1 Month",
  "3 Months",
  "6 Months",
] as const;

export type MembershipPlanOption = typeof MEMBERSHIP_PLANS[number];
