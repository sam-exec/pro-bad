import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin Portal | Enterprise Management",
  description:
    "Administrative control center for badminton academy branches, staff, coaching, and memberships.",
};

export default function AdminPage() {
  return <AdminShell />;
}
