"use client";

import React, { useState } from "react";
import { AdminModuleId } from "@/types/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminEmployees } from "@/components/admin/modules/admin-employees";
import { AdminSales } from "@/components/admin/modules/admin-sales";
import { AdminStudents } from "@/components/admin/modules/admin-students";
import { AdminMemberships } from "@/components/admin/modules/admin-memberships";
import { AdminBranches } from "@/components/admin/modules/admin-branches";
import { AdminReports } from "@/components/admin/modules/admin-reports";
import { AdminAuditLogs } from "@/components/admin/modules/admin-audit-logs";
import { AdminSettings } from "@/components/admin/modules/admin-settings";
import { cn } from "@/lib/utils";

const MODULE_TITLES: Record<AdminModuleId, string> = {
  employees: "Employee Directory & Access Control",
  sales: "Sales & Point of Sale",
  students: "Students & Coaching Registry",
  memberships: "Memberships & Subscriptions",
  branches: "Branch Operations & Capacity",
  reports: "Business Intelligence & Reports",
  "audit-logs": "Security & System Audit Trail",
  settings: "Platform Configuration & Master Settings",
};

export function AdminShell() {
  const [currentModule, setCurrentModule] = useState<AdminModuleId>("employees");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const title = MODULE_TITLES[currentModule] || MODULE_TITLES.employees;

  const renderModule = () => {
    switch (currentModule) {
      case "employees":
        return <AdminEmployees selectedBranch={selectedBranch} />;
      case "sales":
        return <AdminSales selectedBranch={selectedBranch} />;
      case "students":
        return <AdminStudents selectedBranch={selectedBranch} />;
      case "memberships":
        return <AdminMemberships selectedBranch={selectedBranch} />;
      case "branches":
        return <AdminBranches selectedBranch={selectedBranch} />;
      case "reports":
        return <AdminReports selectedBranch={selectedBranch} />;
      case "audit-logs":
        return <AdminAuditLogs selectedBranch={selectedBranch} />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminEmployees selectedBranch={selectedBranch} />;
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 antialiased text-slate-900 font-sans">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Wrapper (offset by sidebar width on desktop) */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out w-full min-w-0",
          isCollapsed ? "lg:ml-[76px]" : "lg:ml-64"
        )}
      >
        {/* Fixed Admin Header */}
        <AdminHeader
          title={title}
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
          onOpenMobileNav={() => setIsMobileOpen(true)}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
}
