"use client";

import React from "react";
import {
  PanelLeftClose,
  PanelLeft,
  X,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { SidebarItem } from "./sidebar-item";
import { DASHBOARD_NAV_ITEMS } from "./types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentModule: string;
  onSelectModule: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  currentModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
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

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out select-none",
          // Mobile responsive drawer
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop width
          isCollapsed ? "lg:w-[76px]" : "lg:w-64",
          "w-72" // mobile drawer width
        )}
      >
        {/* Top Branding Section */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0">
              <Logo size="sm" showText={false} />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                  ProBadminton
                </span>
                <span className="text-[11px] font-semibold text-blue-600 tracking-wider uppercase">
                  Employee Portal
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable if needed) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations & Coaching
            </div>
          )}

          {DASHBOARD_NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={currentModule === item.id}
              isCollapsed={isCollapsed && !isMobileOpen}
              onClick={() => {
                onSelectModule(item.id);
                onCloseMobile();
              }}
            />
          ))}
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
