import { LinkedMember } from "./membership";
import { AuditMetadata } from "./coaching-modules";

export type FlexibleStatus =
  | "Active"
  | "Expiring Soon"
  | "Expired"
  | "Completed";

export interface FlexibleMembershipRecord extends AuditMetadata {
  id: string;
  serialNumber: number; // Auto-generated, read-only sequential number (1, 2, 3...)
  flexibleMembershipId?: string; // Optional legacy identifier
  primaryMemberName: string;
  primaryMobileNumber: string;
  email?: string;
  address: string;
  joiningDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD (45 days from joining date)
  totalHours: number; // default 30
  hoursUsed: number;
  hoursRemaining: number;
  amountPaid: number;
  status: FlexibleStatus;
  remarks?: string;
  additionalMembers: LinkedMember[];
}

/**
 * Automatically calculates expiry date as Joining Date + 45 days
 */
export function calculateExpiryDate(joiningDateStr: string, days = 45): string {
  try {
    const date = new Date(joiningDateStr);
    if (isNaN(date.getTime())) {
      return joiningDateStr;
    }
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  } catch {
    return joiningDateStr;
  }
}

/**
 * Calculates days remaining until expiry relative to current date (or reference 2026-03-07)
 */
export function calculateDaysRemaining(expiryDateStr: string): number {
  try {
    const expiry = new Date(expiryDateStr);
    const now = new Date("2026-03-07"); // local app reference date
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Determines dynamic status based on hours and days remaining
 */
export function determineFlexibleStatus(
  totalHours: number,
  hoursUsed: number,
  expiryDateStr: string
): FlexibleStatus {
  if (hoursUsed >= totalHours) {
    return "Completed";
  }
  const daysLeft = calculateDaysRemaining(expiryDateStr);
  if (daysLeft <= 0) {
    return "Expired";
  }
  if (daysLeft <= 7) {
    return "Expiring Soon";
  }
  return "Active";
}
