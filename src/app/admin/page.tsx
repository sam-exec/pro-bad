import Link from "next/link";
import { Shield, LogOut, Users, Settings, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Dashboard | Employee Management System",
  description: "Admin Dashboard placeholder.",
};

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-lg bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
            <Shield className="w-8 h-8" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900">
            Admin Dashboard (Coming Soon)
          </CardTitle>
          <CardDescription className="text-slate-500 mt-2 text-sm sm:text-base">
            You have successfully logged in to the administration portal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Privileged Session Active (Simulated)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-white border border-slate-200/80 flex items-center gap-3">
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-xs">
                  <p className="text-slate-400 font-medium">Role</p>
                  <p className="font-semibold text-slate-800">Administrator</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200/80 flex items-center gap-3">
                <Settings className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-xs">
                  <p className="text-slate-400 font-medium">Access Level</p>
                  <p className="font-semibold text-slate-800">Tier 1 Superuser</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="w-full h-11 gap-2 text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
