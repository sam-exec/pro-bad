"use client";

import React, { useState } from "react";
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
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ id?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { id?: string; password?: string } = {};

    if (!identifier.trim()) {
      newErrors.id = `Please enter your ${idLabel.toLowerCase()}.`;
    }

    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and begin simulated login
    setErrors({});
    setIsLoading(true);

    // 1-second simulated delay
    setTimeout(() => {
      router.push(targetRoute);
    }, 1000);
  };

  const isEmployee = role === "employee";
  const Icon = isEmployee ? User : Shield;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 transition-all">
        <CardHeader className="text-center pb-6">
          <div
            className={cn(
              "mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors shadow-xs",
              isEmployee
                ? "bg-blue-50 border border-blue-100 text-blue-600"
                : "bg-indigo-50 border border-indigo-100 text-indigo-600"
            )}
          >
            <Icon className="w-7 h-7" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1.5">
            {subtitle}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {/* ID Field */}
            <div className="space-y-1.5">
              <Label htmlFor="identifier" required>
                {idLabel}
              </Label>
              <Input
                id="identifier"
                name="identifier"
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
                autoComplete="username"
                className="h-11"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
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
                  autoComplete="current-password"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
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

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-11 text-base font-semibold shadow-sm transition-all",
                isEmployee
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-slate-900 hover:bg-slate-800"
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
                className="w-full h-11 gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
