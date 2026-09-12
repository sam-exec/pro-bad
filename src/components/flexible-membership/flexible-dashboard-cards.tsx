import React from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FlexibleMembershipRecord } from "@/types/flexible-membership";

interface FlexibleDashboardCardsProps {
  memberships: FlexibleMembershipRecord[];
}

export function FlexibleDashboardCards({
  memberships,
}: FlexibleDashboardCardsProps) {
  const activeCount = memberships.filter((m) => m.status === "Active").length;
  const expiringCount = memberships.filter(
    (m) => m.status === "Expiring Soon"
  ).length;
  const totalRemainingHours = memberships.reduce(
    (acc, m) => acc + (m.status !== "Expired" ? m.hoursRemaining : 0),
    0
  );
  const completedCount = memberships.filter(
    (m) => m.status === "Completed"
  ).length;

  const cards = [
    {
      title: "Active Flexible Memberships",
      value: String(activeCount),
      subtext: "Healthy utilization",
      badge: "In Progress",
      icon: Clock,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border border-blue-100",
    },
    {
      title: "Expiring Within 7 Days",
      value: String(expiringCount),
      subtext: "Urgent session reminders",
      badge: "Action Req.",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border border-amber-100",
    },
    {
      title: "Total Hours Remaining",
      value: `${totalRemainingHours}h`,
      subtext: "Across active packages",
      badge: "Usable Hours",
      icon: Hourglass,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 border border-indigo-100",
    },
    {
      title: "Completed Memberships",
      value: String(completedCount),
      subtext: "30 hours fully utilized",
      badge: "100% Utilized",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border border-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.title}
            className="border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200"
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {c.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {c.value}
                  </p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${c.iconBg} ${c.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {c.badge}
                </span>
                <span className="truncate text-slate-400">{c.subtext}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
