"use client";

import React from "react";
import Link from "next/link";
import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  onOpenMobileNav: () => void;
}

export function Header({ title, onOpenMobileNav }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Mobile menu toggle + Current page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
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
        <div className="hidden sm:block h-6 w-px bg-slate-200" />

        {/* Employee Info & Avatar */}
        <div className="flex items-center gap-3 pl-1">
          {/* Avatar badge */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs select-none">
            AM
          </div>

          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              Alex Morgan
            </span>
            <span className="text-[10px] font-medium text-slate-400 leading-tight">
              EMP-1042
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors ml-1"
            title="Logout and return to home"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
