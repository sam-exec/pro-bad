import React from "react";

export type AdminModuleId =
  | "employees"
  | "sales"
  | "students"
  | "memberships"
  | "branches"
  | "reports"
  | "audit-logs"
  | "settings";

export interface AdminNavigationItem {
  id: AdminModuleId;
  label: string;
  icon: React.ElementType;
}

export type EmployeeRole =
  | "Head Coach"
  | "Assistant Coach"
  | "Desk Manager"
  | "Operations Lead"
  | "Front Desk"
  | "Senior Coach";

export type EmployeeStatus = "Active" | "Inactive";

export interface AdminEmployee {
  id: string;
  employeeId: string; // e.g. "NLG004", "MNK001"
  name: string;
  phone: string;
  email: string;
  branchId: string; // e.g. "branch-nlg", "branch-mnk"
  branchName: string; // "Nallagandla", "Manikonda"
  role: EmployeeRole;
  status: EmployeeStatus;
  joiningDate: string; // YYYY-MM-DD
  lastLogin: string;
  password?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AdminAuditLog {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  branchName: string;
  action: string;
  module: string;
  timestamp: string;
  details?: string;
}

export interface BranchSummaryCardData {
  branchId: string;
  code: string;
  name: string;
  courtsCount: number;
  employeesCount: number;
  studentsCount: number;
  activeMembershipsCount: number;
  revenue: number;
  status: "Active" | "Maintenance";
  phone: string;
  address: string;
}
