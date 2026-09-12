import React from "react";
import { MousePointerClick, Sparkles } from "lucide-react";
import { DashboardCards } from "./dashboard-cards";
import { ModulePlaceholder } from "./module-placeholder";
import { DASHBOARD_NAV_ITEMS } from "./types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KidsCoachingModule } from "@/components/kids-coaching/kids-coaching-module";
import { KidsCoaching1on1Module } from "@/components/kids-coaching-1on1/kids-coaching-1on1-module";
import { AdultsCoachingModule } from "@/components/adults-coaching/adults-coaching-module";
import { AdultsCoaching1on1Module } from "@/components/adults-coaching-1on1/adults-coaching-1on1-module";
import { MembershipModule } from "@/components/membership/membership-module";
import { FlexibleMembershipModule } from "@/components/flexible-membership/flexible-membership-module";

interface ContentAreaProps {
  currentModule: string;
}

export function ContentArea({ currentModule }: ContentAreaProps) {
  const isDashboard = currentModule === "dashboard";
  const activeItem = DASHBOARD_NAV_ITEMS.find((item) => item.id === currentModule);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {isDashboard ? (
          <>
            {/* Welcome Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md shadow-blue-500/15">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Welcome Back</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Good day, Alex!
                </h2>
                <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                  Here is an overview of daily badminton club operations, admissions, and active court memberships.
                </p>
              </div>
            </div>

            {/* 4 Summary Cards */}
            <DashboardCards />

            {/* Large Placeholder Section */}
            <Card className="border border-slate-200/90 bg-white p-8 sm:p-14 text-center rounded-2xl shadow-xs">
              <CardHeader className="p-0 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                  <MousePointerClick className="w-8 h-8 animate-bounce" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                  Select a menu from the sidebar to begin.
                </CardTitle>
                <CardDescription className="text-slate-500 max-w-md mt-2 text-sm sm:text-base">
                  Choose any module from the navigation bar on the left to manage Sales, Coaching schedules, or Club Memberships.
                </CardDescription>
              </CardHeader>
            </Card>
          </>
        ) : currentModule === "kids-coaching" ? (
          <KidsCoachingModule />
        ) : currentModule === "kids-coaching-1-1" ? (
          <KidsCoaching1on1Module />
        ) : currentModule === "adults-coaching" ? (
          <AdultsCoachingModule />
        ) : currentModule === "adults-coaching-1-1" ? (
          <AdultsCoaching1on1Module />
        ) : currentModule === "membership" ? (
          <MembershipModule />
        ) : currentModule === "flexible-membership" ? (
          <FlexibleMembershipModule />
        ) : (
          activeItem && <ModulePlaceholder item={activeItem} />
        )}
      </div>
    </div>
  );
}
