import React from "react";
import {
  LayoutDashboard,
  CircleDollarSign,
  GraduationCap,
  UserCheck,
  Dumbbell,
  Target,
  CreditCard,
  CalendarClock,
  Heart,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const DASHBOARD_NAV_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "sales",
    label: "Sales",
    icon: CircleDollarSign,
  },
  {
    id: "kids-coaching",
    label: "Kids Coaching",
    icon: GraduationCap,
  },
  {
    id: "kids-coaching-1-1",
    label: "Kids Coaching 1-1",
    icon: UserCheck,
  },
  {
    id: "adults-coaching",
    label: "Adults Coaching",
    icon: Dumbbell,
  },
  {
    id: "adults-coaching-1-1",
    label: "Adults Coaching 1-1",
    icon: Target,
  },
  {
    id: "membership",
    label: "Membership",
    icon: CreditCard,
  },
  {
    id: "flexible-membership",
    label: "Flexible Membership",
    icon: CalendarClock,
  },
  {
    id: "super-moms",
    label: "Super Moms",
    icon: Heart,
    badge: "Special",
  },
];
