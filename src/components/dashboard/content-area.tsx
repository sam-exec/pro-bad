import React from "react";
import { ModulePlaceholder } from "./module-placeholder";
import { DASHBOARD_NAV_ITEMS } from "./types";
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
  const activeItem = DASHBOARD_NAV_ITEMS.find((item) => item.id === currentModule);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {currentModule === "kids-coaching" ? (
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
