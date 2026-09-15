import Link from "next/link";
import { User, Shield, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <div className="mb-4 p-3 rounded-2xl bg-white shadow-xs border border-slate-200/80">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Academy Management Portal
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-md">
            Secure portal for employees and administrators.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Employee Login */}
          <Card className="flex flex-col justify-between border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group bg-white">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <User className="w-7 h-7" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Employee Login
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm sm:text-base mt-2">
                For staff members to manage daily records.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Clock-in & attendance management
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Personal profile & work schedule
                </li>
              </ul>
            </CardContent>

            <CardFooter>
              <Link href="/login/employee" className="w-full">
                <Button className="w-full group/btn gap-2 text-sm sm:text-base font-semibold py-6">
                  <span>Continue as Employee</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Card 2: Admin Login */}
          <Card className="flex flex-col justify-between border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group bg-white">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                <Shield className="w-7 h-7" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Admin Login
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm sm:text-base mt-2">
                For administrators and owners.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Organization & staff controls
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Reports, permissions & security audit
                </li>
              </ul>
            </CardContent>

            <CardFooter>
              <Link href="/login/admin" className="w-full">
                <Button
                  variant="default"
                  className="w-full bg-slate-900 hover:bg-slate-800 group/btn gap-2 text-sm sm:text-base font-semibold py-6"
                >
                  <span>Continue as Admin</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
