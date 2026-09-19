"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Loader2, User, Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

interface LoginFormProps {
  role: "employee" | "admin";
  title: string;
  subtitle: string;
  idLabel: string;
  idPlaceholder: string;
  targetRoute: string;
}

export function LoginForm({
  role,
  title,
  subtitle,
  idLabel,
  idPlaceholder,
  targetRoute,
}: LoginFormProps) {
  const router = useRouter();
  const { loginEmployee } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ id?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const isEmployee = role === "employee";
  const Icon = isEmployee ? User : Shield;

  // Clean up any leftover query params immediately on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleLogin = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isEmployee) {
      // Direct access to Admin Portal without authentication block
      router.push(targetRoute);
      return;
    }

    // Clear any previous error and begin employee login
    setErrors({});
    setIsLoading(true);

    loginEmployee(identifier);

    // Simulated delay for smooth transition
    setTimeout(() => {
      router.push(targetRoute);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 transition-all">
        <CardHeader className="text-center pb-6 pt-8">
          <div
            className={cn(
              "mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-xs",
              isEmployee
                ? "bg-blue-50 border border-blue-100/80 text-blue-600"
                : "bg-indigo-50 border border-indigo-100/80 text-indigo-600"
            )}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1.5">
            {subtitle}
          </CardDescription>
        </CardHeader>

        {/* Prevent native HTML browser form submission completely */}
        <form
          action="javascript:void(0);"
          method="POST"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogin(e);
            return false;
          }}
          noValidate
        >
          <CardContent className="space-y-4 pt-0">
            {/* ID Field */}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-xs font-semibold text-slate-700">
                {idLabel}
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                placeholder={idPlaceholder}
                disabled={isLoading}
                hasError={Boolean(errors.id)}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.id) {
                    setErrors((prev) => ({ ...prev, id: undefined }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogin(e);
                  }
                }}
                autoComplete="username"
                className="h-10 text-sm font-medium"
              />
              {errors.id && (
                <p
                  id="identifier-error"
                  className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1"
                >
                  {errors.id}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  hasError={Boolean(errors.password)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogin(e);
                    }
                  }}
                  autoComplete="current-password"
                  className="h-10 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1"
                >
                  {errors.password}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2 pb-6">
            <Button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className={cn(
                "w-full h-10 text-sm font-semibold shadow-xs transition-all cursor-pointer",
                isEmployee
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              )}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span>Login</span>
              )}
            </Button>

            <Link href="/" className="w-full">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="w-full h-10 gap-2 text-sm text-slate-600 hover:text-slate-900 border-slate-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </Link>

            <div className="pt-2 text-center">
              <span className="text-[11px] font-medium text-slate-400">v1.0</span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
