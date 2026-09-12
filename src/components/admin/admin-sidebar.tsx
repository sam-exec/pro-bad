"use client";

import React from "react";
import {
  Users,
  CircleDollarSign,
  GraduationCap,
  CreditCard,
  Building2,
  BarChart3,
  History,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { AdminModuleId, AdminNavigationItem } from "@/types/admin";
import { cn } from "@/lib/utils";

export const ADMIN_NAV_ITEMS: AdminNavigationItem[] = [
  {
    id: "employees",
    label: "Employees",
    icon: Users,
  },
  {
    id: "sales",
    label: "Sales",
    icon: CircleDollarSign,
  },
  {
    id: "students",
    label: "Students",
    icon: GraduationCap,
  },
  {
    id: "memberships",
    label: "Memberships",
    icon: CreditCard,
  },
  {
    id: "branches",
    label: "Branches",
    icon: Building2,
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    icon: History,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  currentModule: AdminModuleId;
  onSelectModule: (id: AdminModuleId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  currentModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out select-none",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-[76px]" : "lg:w-64",
          "w-72"
        )}
      >
        {/* Header / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0">
              <Logo size="sm" showText={false} />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                    Admin Portal
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Shield className="w-2.5 h-2.5" />
                    Tier 1
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 tracking-wide truncate">
                  Enterprise Management
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Administration & Analytics
            </div>
          )}

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectModule(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={cn(
                  "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none group text-left cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/70",
                  isCollapsed && !isMobileOpen && "justify-center px-2 py-3"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform group-hover:scale-105",
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-indigo-600"
                  )}
                  aria-hidden="true"
                />

                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate flex-1 text-[13.5px] tracking-tight">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Bar / Collapse Toggle */}
        <div className="p-3 border-t border-slate-200/80 hidden lg:block shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4 mx-auto text-slate-500" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
