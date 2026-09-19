"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/context/auth-context";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on employee or admin dashboard routes, do not render marketing navbar/footer
  const isDashboardRoute =
    pathname?.startsWith("/employee") || pathname?.startsWith("/admin");

  return (
    <AuthProvider>
      {isDashboardRoute ? (
        <div className="h-screen w-screen overflow-hidden flex flex-col">{children}</div>
      ) : (
        <>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </>
      )}
    </AuthProvider>
  );
}
