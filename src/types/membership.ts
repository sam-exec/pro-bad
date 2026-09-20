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
  timing?: string;       // Session timing assigned at registration, e.g. "6:00 AM – 7:00 AM"
  courtNumber?: string;  // Court assigned, e.g. "Court 1"
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

export const COURT_NUMBERS = [
  "Court 1",
  "Court 2",
  "Court 3",
  "Court 4",
  "Court 5",
  "Court 6",
  "Court 7",
] as const;

export type CourtNumber = typeof COURT_NUMBERS[number];

export const MEMBERSHIP_TIMINGS = [
  "06:00 AM - 07:00 AM",
  "07:00 AM - 08:00 AM",
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM",
] as const;
