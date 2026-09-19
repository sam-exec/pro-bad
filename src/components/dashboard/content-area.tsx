import React from "react";
import { ModulePlaceholder } from "./module-placeholder";
import { DASHBOARD_NAV_ITEMS } from "./types";
import { KidsCoachingModule } from "@/components/kids-coaching/kids-coaching-module";
import { KidsCoaching1on1Module } from "@/components/kids-coaching-1on1/kids-coaching-1on1-module";
import { AdultsCoachingModule } from "@/components/adults-coaching/adults-coaching-module";
import { AdultsCoaching1on1Module } from "@/components/adults-coaching-1on1/adults-coaching-1on1-module";
import { MembershipModule } from "@/components/membership/membership-module";
import { FlexibleMembershipModule } from "@/components/flexible-membership/flexible-membership-module";
import { SuperMomsModule } from "@/components/super-moms/super-moms-module";
import { EmployeeSalesModule } from "@/components/sales/employee-sales-module";
import { EmployeeInventoryModule } from "@/components/inventory/employee-inventory-module";
import { EmployeePurchaseHistoryModule } from "@/components/purchase-history/employee-purchase-history-module";

interface ContentAreaProps {
  currentModule: string;
}

export function ContentArea({ currentModule }: ContentAreaProps) {
  const activeItem = DASHBOARD_NAV_ITEMS.find((item) => item.id === currentModule);

  return (
    <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto w-full">
        {currentModule === "pro-bd-shop" || currentModule === "sales" ? (
          <EmployeeSalesModule />
        ) : currentModule === "inventory" ? (
          <EmployeeInventoryModule />
        ) : currentModule === "purchase-history" ? (
          <EmployeePurchaseHistoryModule />
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
        ) : currentModule === "super-moms" ? (
          <SuperMomsModule />
        ) : (
          activeItem && <ModulePlaceholder item={activeItem} />
        )}
      </div>
    </main>
  );
}
