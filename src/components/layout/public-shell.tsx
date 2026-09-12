"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on employee or admin dashboard routes, do not render marketing navbar/footer
  const isDashboardRoute =
    pathname?.startsWith("/employee") || pathname?.startsWith("/admin");

  if (isDashboardRoute) {
    return <div className="h-screen w-screen overflow-hidden flex flex-col">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
