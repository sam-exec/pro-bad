import React from "react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "./types";

interface SidebarItemProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

export function SidebarItem({
  item,
  isActive,
  isCollapsed,
  onClick,
}: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none group text-left cursor-pointer",
        isActive
          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/70",
        isCollapsed && "justify-center px-2 py-3"
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5 shrink-0 transition-transform group-hover:scale-105",
          isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"
        )}
        aria-hidden="true"
      />

      {!isCollapsed && (
        <span className="truncate flex-1 text-[13.5px] tracking-tight">
          {item.label}
        </span>
      )}
    </button>
  );
}
