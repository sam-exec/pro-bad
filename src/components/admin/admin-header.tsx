"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  onOpenMobileNav: () => void;
}

export function AdminHeader({
  title,
  onOpenMobileNav,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

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
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
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
