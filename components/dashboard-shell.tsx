"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Plus, X } from "lucide-react";
import { SiteLogo } from "@/components/brand/site-logo";
import { UserMenu } from "@/components/auth/user-menu";
import { ModelTierSelect } from "@/components/model-tier-select";
import { ModelTierProvider } from "@/lib/client/model-tier-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Sessions", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/new", label: "New search", icon: Plus, exact: false },
] as const;

function SidebarNav({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-4 group-hover/sidebar:px-3">
      <p
        className={cn(
          "mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500",
          compact &&
            "hidden max-h-0 overflow-hidden opacity-0 group-hover/sidebar:block group-hover/sidebar:max-h-none group-hover/sidebar:opacity-100",
        )}
      >
        Menu
      </p>
      <div className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={compact ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors",
                compact
                  ? "justify-center px-2 group-hover/sidebar:justify-start group-hover/sidebar:gap-2.5 group-hover/sidebar:px-3"
                  : "gap-2.5 px-3",
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  compact &&
                    "hidden max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover/sidebar:inline group-hover/sidebar:max-w-none group-hover/sidebar:opacity-100",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function SidebarContent({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "shrink-0 py-5",
          compact
            ? "flex justify-center px-3 group-hover/sidebar:justify-start group-hover/sidebar:px-5"
            : "px-5",
        )}
      >
        <Link href="/" onClick={onNavigate} className="block min-w-0">
          <SiteLogo
            showWordmark
            compact
            className={cn(
              compact &&
                "[&>span:last-child]:hidden [&>span:last-child]:whitespace-nowrap group-hover/sidebar:[&>span:last-child]:inline",
            )}
          />
        </Link>
      </div>
      <SidebarNav onNavigate={onNavigate} compact={compact} />
      <div
        className={cn(
          "mt-auto shrink-0 border-t border-zinc-200 dark:border-zinc-800",
          compact
            ? "px-3 py-4 group-hover/sidebar:px-5 group-hover/sidebar:py-5"
            : "px-5 py-5",
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            "mb-4 block text-xs text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300",
            compact &&
              "mb-0 hidden max-h-0 overflow-hidden opacity-0 group-hover/sidebar:mb-4 group-hover/sidebar:block group-hover/sidebar:max-h-none group-hover/sidebar:opacity-100",
          )}
        >
          ← Back to home
        </Link>
        <UserMenu signInNext="/dashboard" compact={compact} />
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  const pageTitle =
    pathname === "/dashboard/new" ? "New search" : "Sessions";

  return (
    <ModelTierProvider>
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 lg:flex-row">
        <header className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {pageTitle}
          </span>
          <ModelTierSelect compact className="shrink-0" />
        </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <span className="text-sm font-semibold">Navigation</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <aside className="group/sidebar fixed inset-y-0 left-0 z-40 hidden w-16 flex-col overflow-hidden border-r border-zinc-200 bg-white transition-[width,box-shadow] duration-200 ease-in-out hover:z-50 hover:w-60 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
        <SidebarContent compact />
      </aside>

      <main className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-16">
        <header className="hidden items-center justify-between border-b border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {pageTitle}
          </span>
          <ModelTierSelect />
        </header>
        {children}
      </main>
    </div>
    </ModelTierProvider>
  );
}
