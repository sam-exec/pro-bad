import { PaymentStatus, StudentStatus, Gender, PaymentMethod } from "./kids-coaching";

export interface AuditMetadata {
  recordId: string;
  branchId: string;
  branchName: string;
  employeeId: string;
  employeeName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
}

// 1. Kids Coaching 1-1
export interface Kids1on1Student extends AuditMetadata {
  id: string;
  serialNumber: number; // Auto-generated separate sequence (1, 2, 3...)
  studentId?: string; // Kept optional for legacy Excel mapping
  studentName: string;
  parentName: string;
  parentMobile: string;
  age: number;
  gender: Gender;
  coach: string;
  preferredTiming: string;
  sessionPackage: string; // e.g. "12 Sessions"
  totalSessions: number;
  sessionsCompleted: number;
  sessionsRemaining: number;
  feeAmount: number;
  amountPaid: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod; // Cash | UPI
  joiningDate: string;
  month: string;
  year: number;
  status: StudentStatus;
  remarks?: string;
}

// 2. Adults Coaching (Group)
export interface AdultCoachMember extends AuditMetadata {
  id: string;
  serialNumber: number; // Auto-generated sequential serial number (1, 2, 3...)
  memberId?: string; // Optional legacy identifier
  memberName: string;
  mobileNumber: string;
  age: number;
  gender: Gender;
  joiningDate: string;
  batch: string;
  coach: string;
  monthlyFee: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  currentMonth: string;
  year: number;
  status: StudentStatus;
  remarks?: string;
}

// 3. Adults Coaching 1-1
export interface Adult1on1Member extends AuditMetadata {
  id: string;
  serialNumber: number; // Auto-generated sequential serial number (1, 2, 3...)
  memberId?: string; // Optional legacy identifier
  memberName: string;
  mobileNumber: string;
  age: number;
  gender: Gender;
  coach: string;
  preferredTiming: string;
  sessionPackage: string;
  totalSessions: number;
  sessionsCompleted: number;
  sessionsRemaining: number;
  feeAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  joiningDate: string;
  month: string;
  year: number;
  status: StudentStatus;
  remarks?: string;
}

export const SESSION_PACKAGES = [
  "8 Sessions (1 Month)",
  "12 Sessions (6 Weeks)",
  "16 Sessions (2 Months)",
  "20 Sessions (10 Weeks)",
  "24 Sessions (3 Months)",
] as const;

export const TIMING_SLOTS_1ON1 = [
  "Mon/Wed/Fri (04:00 PM - 05:00 PM)",
  "Mon/Wed/Fri (05:00 PM - 06:00 PM)",
  "Tue/Thu/Sat (06:00 AM - 07:00 AM)",
  "Tue/Thu/Sat (07:00 AM - 08:00 AM)",
  "Tue/Thu/Sat (06:00 PM - 07:00 PM)",
  "Weekend Special (09:00 AM - 10:30 AM)",
] as const;

export const ADULT_BATCHES = [
  "Early Bird Fitness (06:00 AM - 07:30 AM)",
  "Morning Pro Squad (07:30 AM - 09:00 AM)",
  "Evening Masters (07:30 PM - 09:00 PM)",
  "Late Night League (09:00 PM - 10:30 PM)",
  "Weekend Recreational Club (07:00 AM - 09:00 AM)",
] as const;
