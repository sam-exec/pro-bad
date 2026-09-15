import Link from "next/link";
import { Logo } from "@/components/common/logo";

export function Navbar() {
  return (
    <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-lg"
          aria-label="Academy Management Portal Home"
        >
          <Logo size="sm" />
        </Link>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            v1.0
          </span>
        </div>
      </div>
    </header>
  );
}
