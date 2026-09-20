"use client";

import React, { useState } from "react";
import { AdminModuleId } from "@/types/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminEmployees } from "@/components/admin/modules/admin-employees";
import { AdminSales } from "@/components/admin/modules/admin-sales";
import { AdminInventory } from "@/components/admin/modules/admin-inventory";
import { AdminPurchaseHistory } from "@/components/admin/modules/admin-purchase-history";
import { AdminKidsCoaching } from "@/components/admin/modules/admin-kids-coaching";
import { AdminKidsCoaching1on1 } from "@/components/admin/modules/admin-kids-coaching-1on1";
import { AdminAdultsCoaching } from "@/components/admin/modules/admin-adults-coaching";
import { AdminAdultsCoaching1on1 } from "@/components/admin/modules/admin-adults-coaching-1on1";
import { AdminMembership } from "@/components/admin/modules/admin-membership";
import { AdminFlexibleMembership } from "@/components/admin/modules/admin-flexible-membership";
import { AdminSuperMoms } from "@/components/admin/modules/admin-super-moms";
import { AdminReports } from "@/components/admin/modules/admin-reports";
import { AdminAuditLogs } from "@/components/admin/modules/admin-audit-logs";
import { cn } from "@/lib/utils";

const MODULE_TITLES: Record<AdminModuleId, string> = {
  employees: "Employee Directory & Access Control",
  "pro-bd-shop": "PBA Store Management & Invoicing",
  sales: "PBA Store Management & Invoicing",
  inventory: "Master Inventory & Stock Management",
  "purchase-history": "Purchase History & Supplier Bills",
  "kids-coaching": "Kids Coaching",
  "kids-coaching-1-1": "Kids Coaching 1-1",
  "adults-coaching": "Adults Coaching",
  "adults-coaching-1-1": "Adults Coaching 1-1",
  membership: "Club Membership",
  "flexible-membership": "Flexible 30-Hour Membership",
  "super-moms": "Super Moms Badminton",
  reports: "Business Intelligence & Reports",
  "audit-logs": "Security & System Audit Trail",
};

export function AdminShell() {
  const [currentModule, setCurrentModule] = useState<AdminModuleId>("employees");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const title = MODULE_TITLES[currentModule] || MODULE_TITLES.employees;

  const renderModule = () => {
    switch (currentModule) {
      case "employees":
        return <AdminEmployees />;
      case "pro-bd-shop":
      case "sales":
        return <AdminSales />;
      case "inventory":
        return <AdminInventory />;
      case "purchase-history":
        return <AdminPurchaseHistory />;
      case "kids-coaching":
        return <AdminKidsCoaching />;
      case "kids-coaching-1-1":
        return <AdminKidsCoaching1on1 />;
      case "adults-coaching":
        return <AdminAdultsCoaching />;
      case "adults-coaching-1-1":
        return <AdminAdultsCoaching1on1 />;
      case "membership":
        return <AdminMembership />;
      case "flexible-membership":
        return <AdminFlexibleMembership />;
      case "super-moms":
        return <AdminSuperMoms />;
      case "reports":
        return <AdminReports />;
      case "audit-logs":
        return <AdminAuditLogs />;
      default:
        return <AdminEmployees />;
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
