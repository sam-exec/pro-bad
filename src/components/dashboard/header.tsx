"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

interface HeaderProps {
  title: string;
  onOpenMobileNav: () => void;
}

export function Header({ title, onOpenMobileNav }: HeaderProps) {
  const router = useRouter();
  const { employeeId, employeeName, logoutEmployee } = useAuth();

  // Compute initials for the avatar
  const initials = employeeName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logoutEmployee();
    router.push("/");
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Mobile menu toggle + Employee Portal Title */}
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
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {title === "Dashboard" || title === "Sales" ? "PBA Store" : title}
          </h1>
        </div>
      </div>

      {/* Right: Employee profile, logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Employee Info & Avatar Widget */}
        <div className="flex items-center gap-3 pl-1">
          {/* Avatar badge */}
          <div className="w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow-xs select-none bg-gradient-to-tr from-blue-600 to-indigo-600">
            {initials || "EM"}
          </div>

          {/* Structured Employee Details Display */}
          <div className="hidden md:flex flex-col text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 leading-tight">
              <span>{employeeName}</span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {employeeId}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Staff Operations
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-7 w-px bg-slate-200" />

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors ml-1 cursor-pointer"
          title="Logout of Employee Portal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
