"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { ContentArea } from "@/components/dashboard/content-area";
import { DASHBOARD_NAV_ITEMS } from "@/components/dashboard/types";
import { cn } from "@/lib/utils";

export default function EmployeeDashboardPage() {
  const [currentModule, setCurrentModule] = useState("sales");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Determine current page title
  const activeItem = DASHBOARD_NAV_ITEMS.find((item) => item.id === currentModule);
  const currentTitle = activeItem ? activeItem.label : "Sales";

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 antialiased">
      {/* Fixed Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(id) => setCurrentModule(id)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Wrapper (offset by sidebar width on desktop) */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out w-full",
          isCollapsed ? "lg:ml-[76px]" : "lg:ml-64"
        )}
      >
        {/* Fixed Header */}
        <Header
          title={currentTitle}
          onOpenMobileNav={() => setIsMobileOpen(true)}
        />

        {/* Scrollable Main Content */}
        <ContentArea currentModule={currentModule} />
      </div>
    </div>
  );
}
