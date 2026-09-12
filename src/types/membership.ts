import { PaymentStatus, StudentStatus } from "./kids-coaching";
import { AuditMetadata } from "./coaching-modules";

export interface LinkedMember {
  id: string;
  memberId: string; // e.g. LM-001
  name: string;
  mobileNumber: string;
  individualContribution: number;
}

export interface MembershipRecord extends AuditMetadata {
  id: string;
  membershipId: string; // e.g. MEM-2026-001
  primaryMemberName: string;
  primaryMobileNumber: string;
  email?: string;
  address: string;
  membershipPlan: string;
  joiningDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  monthlyFee: number;
  amountPaid: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  status: StudentStatus;
  remarks?: string;
  currentMonth: string;
  year: number;
  additionalMembers: LinkedMember[];
}

export const MEMBERSHIP_PLANS = [
  "Annual Platinum Family (All Access)",
  "Yearly Family Club Pack",
  "Quarterly Family Pack",
  "Monthly Gold Family",
  "Annual Individual Elite",
  "Monthly Individual Standard",
] as const;
