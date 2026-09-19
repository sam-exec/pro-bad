/**
 * Canonical Payment Types & Definitions
 * Standardized across all modules in Employee and Admin Portals.
 */

export type PaymentMethod = "Cash" | "UPI";

export type PaymentStatus = "Paid" | "Partial" | "Pending";

export const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "UPI"];

export const PAYMENT_STATUSES: PaymentStatus[] = ["Paid", "Partial", "Pending"];

/**
 * Common payment fields required on any payment-recording entity
 * for future database and Excel synchronization.
 */
export interface PaymentRecordMeta {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  employeeId: string;
  timestamp?: string;
}
