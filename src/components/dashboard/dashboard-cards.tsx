import React from "react";
import {
  TrendingUp,
  UserPlus,
  CreditCard,
  CheckSquare,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  badgeText?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function MetricCard({
  title,
  value,
  subtext,
  badgeText,
  isPositive,
  icon: Icon,
  iconColor,
  iconBg,
}: MetricCardProps) {
  return (
    <Card className="border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </p>
          </div>

          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
              iconBg,
              iconColor
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          {badgeText && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold",
                isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              )}
            >
              {isPositive && <ArrowUpRight className="w-3 h-3" />}
              {badgeText}
            </span>
          )}
          <span className="truncate">{subtext}</span>
        </div>
      </CardContent>
    </Card>
  );
}

import { useBranch } from "@/context/branch-context";

export function DashboardCards() {
  const { currentBranch } = useBranch();
  const isManikonda = currentBranch.code === "MNK";

  const cards: MetricCardProps[] = [
    {
      title: "Today's Sales",
      value: isManikonda ? "₹2,150.00" : "₹3,480.00",
      subtext: isManikonda ? "Puppalguda court counters" : "Huda layout counter",
      badgeText: isManikonda ? "+9.8%" : "+14.5%",
      isPositive: true,
      icon: TrendingUp,
      iconColor: isManikonda ? "text-purple-600" : "text-blue-600",
      iconBg: isManikonda
        ? "bg-purple-50 border border-purple-100"
        : "bg-blue-50 border border-blue-100",
    },
    {
      title: "New Admissions Today",
      value: isManikonda ? "8" : "14",
      subtext: isManikonda ? "3 Kids, 5 Adults" : "6 Kids, 8 Adults",
      badgeText: isManikonda ? "+2" : "+5",
      isPositive: true,
      icon: UserPlus,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border border-emerald-100",
    },
    {
      title: "Active Memberships",
      value: isManikonda ? "264" : "412",
      subtext: isManikonda ? "97.4% retention" : "98.6% retention",
      badgeText: isManikonda ? "Growing" : "Stable",
      isPositive: true,
      icon: CreditCard,
      iconColor: isManikonda ? "text-purple-600" : "text-indigo-600",
      iconBg: isManikonda
        ? "bg-purple-50 border border-purple-100"
        : "bg-indigo-50 border border-indigo-100",
    },
    {
      title: "Pending Tasks",
      value: isManikonda ? "3" : "5",
      subtext: isManikonda ? "1 court equipment check" : "2 fee follow-ups",
      badgeText: "Action req.",
      isPositive: false,
      icon: CheckSquare,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 border border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
