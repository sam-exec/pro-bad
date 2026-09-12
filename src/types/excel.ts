/**
 * Excel-Based Data Architecture Types & Definitions
 * 
 * Defines the 5 Master Excel Workbooks, Worksheets, Record Metadata,
 * and mapping contracts for future Excel/Backend integration.
 */

/**
 * Standard hidden metadata fields present on every record across all workbooks.
 * Essential for multi-branch data isolation, audit trails, and future synchronization.
 * (Hidden from the UI, managed automatically by the service layer).
 */
export interface ExcelRecordMeta {
  recordId?: string;      // Unique record identifier (maps to id / Record ID)
  branchId: string;       // Branch ID (e.g., "branch-nlg", "branch-mnk")
  branchName: string;     // Branch Name (e.g., "Nallagandla", "Manikonda")
  employeeId: string;     // Stamped employee ID of creator/assignee
  employeeName: string;   // Stamped employee name
  createdAt: string;      // ISO 8601 Timestamp of creation
  updatedAt: string;      // ISO 8601 Timestamp of last modification
  lastModifiedBy: string; // Employee ID of user who last modified the record
}

/**
 * The 5 Master Excel Workbooks
 */
export const EXCEL_WORKBOOKS = {
  SALES: "Sales.xlsx",
  KIDS_COACHING: "Kids Coaching.xlsx",
  ADULTS_COACHING: "Adults Coaching.xlsx",
  MEMBERSHIP: "Membership.xlsx",
  SUPER_MOMS: "Super Moms.xlsx",
} as const;

export type ExcelWorkbookName =
  (typeof EXCEL_WORKBOOKS)[keyof typeof EXCEL_WORKBOOKS];

/**
 * Worksheet Mapping Contract
 * Maps each module to its designated Master Workbook and Worksheet.
 */
export const EXCEL_WORKSHEETS = {
  // 1. Sales Module -> Sales.xlsx -> Sales Worksheet
  SALES: {
    workbook: EXCEL_WORKBOOKS.SALES,
    worksheet: "Sales",
  },
  // 2. Kids Coaching Module -> Kids Coaching.xlsx -> Kids Coaching Worksheet
  KIDS_COACHING: {
    workbook: EXCEL_WORKBOOKS.KIDS_COACHING,
    worksheet: "Kids Coaching",
  },
  // Kids Coaching 1-1 Module -> Kids Coaching.xlsx -> Kids Coaching 1-1 Worksheet
  KIDS_COACHING_1ON1: {
    workbook: EXCEL_WORKBOOKS.KIDS_COACHING,
    worksheet: "Kids Coaching 1-1",
  },
  // 3. Adults Coaching Module -> Adults Coaching.xlsx -> Adults Coaching Worksheet
  ADULTS_COACHING: {
    workbook: EXCEL_WORKBOOKS.ADULTS_COACHING,
    worksheet: "Adults Coaching",
  },
  // Adults Coaching 1-1 Module -> Adults Coaching.xlsx -> Adults Coaching 1-1 Worksheet
  ADULTS_COACHING_1ON1: {
    workbook: EXCEL_WORKBOOKS.ADULTS_COACHING,
    worksheet: "Adults Coaching 1-1",
  },
  // 4. Membership Module -> Membership.xlsx -> Membership Worksheet
  MEMBERSHIP: {
    workbook: EXCEL_WORKBOOKS.MEMBERSHIP,
    worksheet: "Membership",
  },
  // Flexible Membership Module -> Membership.xlsx -> Flexible Membership Worksheet
  FLEXIBLE_MEMBERSHIP: {
    workbook: EXCEL_WORKBOOKS.MEMBERSHIP,
    worksheet: "Flexible Membership",
  },
  // 5. Super Moms Module -> Super Moms.xlsx -> Super Moms Worksheet
  SUPER_MOMS: {
    workbook: EXCEL_WORKBOOKS.SUPER_MOMS,
    worksheet: "Super Moms",
  },
} as const;

export interface ExcelQueryOptions {
  branchId?: string;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
