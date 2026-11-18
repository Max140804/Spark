"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Sparkles,
  Home,
  BookOpen,
  Users,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavigationItem = { href: string; label: string; icon: LucideIcon };

const navByRole: Record<string, NavigationItem[]> = {
  PUPIL: [
    { href: "/pupil", label: "My classes", icon: BookOpen },
  ],
  TEACHER: [
    { href: "/teacher", label: "Overview", icon: Home },
  ],
  PARENT: [
    { href: "/parent", label: "Family", icon: Users },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: Home },
  ],
};

export function AppShell({
  user,
  children,
}: {
  user: { name: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = navByRole[user.role] ?? [];

  return (
    <div className="min-h-dvh bg-spark-indigo-50/50">
      <header className="sticky top-0 z-40 border-b border-spark-indigo-100 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-spark-amber-400 shadow-spark">
              <Sparkles className="size-5 text-spark-indigo-900" />
            </div>
            <span className="font-display text-lg font-bold text-spark-indigo-900">
              SPARK
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-spark-amber-100 text-spark-indigo-900"
                      : "text-spark-indigo-700 hover:bg-spark-indigo-50"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-spark-indigo-900 md:block">
              {user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex size-9 items-center justify-center rounded-2xl text-spark-indigo-700 hover:bg-spark-indigo-50"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 md:hidden">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-semibold",
                  active
                    ? "bg-spark-amber-100 text-spark-indigo-900"
                    : "text-spark-indigo-700"
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}