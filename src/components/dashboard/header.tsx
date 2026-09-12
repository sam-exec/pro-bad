"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/context/branch-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  onOpenMobileNav: () => void;
}

export function Header({ title, onOpenMobileNav }: HeaderProps) {
  const router = useRouter();
  const { currentBranch, employeeId, employeeName, logoutEmployee } = useBranch();

  // Compute initials for the avatar
  const initials = employeeName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logoutEmployee();
    router.push("/");
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Mobile menu toggle + Employee Portal & Branch Name */}
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
              Employee Portal
            </span>
            {/* Prominent Branch Badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border shadow-2xs transition-colors",
                currentBranch.badgeBg,
                currentBranch.badgeText,
                currentBranch.badgeBorder
              )}
              title={`Active Branch: ${currentBranch.name} (${currentBranch.code})`}
            >
              <span>📍</span>
              <span>{currentBranch.name}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              {currentBranch.name} Branch
            </h1>
            {title !== "Dashboard" && (
              <span className="text-xs font-semibold text-slate-400">
                / {title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Employee profile, notification, logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Icon */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-7 w-px bg-slate-200" />

        {/* Employee Info & Avatar Widget */}
        <div className="flex items-center gap-3 pl-1">
          {/* Avatar badge */}
          <div
            className={cn(
              "w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow-xs select-none transition-colors",
              currentBranch.code === "MNK"
                ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                : "bg-gradient-to-tr from-blue-600 to-indigo-600"
            )}
          >
            {initials || "EM"}
          </div>

          {/* Structured Employee & Branch Details Display */}
          <div className="hidden md:flex flex-col text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 leading-tight">
              <span>{employeeName}</span>
              <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {employeeId}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 leading-tight mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>
                Branch:{" "}
                <span className="font-semibold text-slate-800">
                  {currentBranch.name}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors ml-1 cursor-pointer"
          title="Logout and return to home"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
