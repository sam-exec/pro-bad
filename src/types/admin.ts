import React from "react";

export type AdminModuleId =
  | "employees"
  | "pro-bd-shop"
  | "sales"
  | "inventory"
  | "purchase-history"
  | "kids-coaching"
  | "kids-coaching-1-1"
  | "adults-coaching"
  | "adults-coaching-1-1"
  | "membership"
  | "flexible-membership"
  | "super-moms"
  | "reports"
  | "audit-logs";

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
  employeeId: string;
  name: string;
  phone: string;
  email: string;
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
  action: string;
  module: string;
  timestamp: string;
  details?: string;
}
