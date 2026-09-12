"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  LogOut,
  Building2,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRANCHES } from "@/config/branches";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title: string;
  selectedBranch: string; // "all" | "branch-nlg" | "branch-mnk"
  onSelectBranch: (branchId: string) => void;
  onOpenMobileNav: () => void;
}

export function AdminHeader({
  title,
  selectedBranch,
  onSelectBranch,
  onOpenMobileNav,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  const currentBranchLabel =
    selectedBranch === "all"
      ? "All Branches"
      : BRANCHES.find((b) => b.id === selectedBranch)?.name || "All Branches";

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Mobile nav toggle + Module Title & Path */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Admin Portal
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-[11px] font-semibold text-indigo-600">
              {currentBranchLabel}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle/Right: Branch Selector & Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Branch Selector Dropdown */}
        <div className="relative flex items-center">
          <label htmlFor="admin-branch-selector" className="sr-only">
            Select Active Branch
          </label>
          <div className="relative flex items-center">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              id="admin-branch-selector"
              value={selectedBranch}
              onChange={(e) => onSelectBranch(e.target.value)}
              className="h-9.5 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 cursor-pointer appearance-none transition-all"
            >
              <option value="all">📍 All Branches (Combined)</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  📍 {b.name} ({b.code})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifications"
          title="Administrative Alerts"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>

        {/* Vertical Divider */}
        <div className="hidden sm:block h-7 w-px bg-slate-200" />

        {/* Admin Profile Widget */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs select-none">
            SA
          </div>

          <div className="hidden md:flex flex-col text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 leading-tight">
              <span>Super Admin</span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                ADM001
              </span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Enterprise Access
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors ml-1 cursor-pointer"
          title="Logout of Admin Portal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
