"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WorkspaceLayoutProvider,
  useWorkspaceLayout,
} from "@/lib/client/workspace-layout-context";
import { StatusBadge } from "./status-badge";

export function TabNav({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "-mx-3 flex gap-1 overflow-x-auto border-b border-zinc-200 px-3 dark:border-zinc-800 sm:mx-0 sm:px-0",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange?.(tab.id)}
          className={cn(
            "shrink-0 whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors sm:px-4",
            active === tab.id
              ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300",
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function SidebarHeader({
  workspaceId,
  title,
  onCollapse,
}: {
  workspaceId: string;
  title?: string;
  onCollapse?: () => void;
}) {
  return (
    <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          >
            ← All sessions
          </Link>
          <Link
            href={`/workspace/${workspaceId}`}
            className="mt-2 block truncate font-semibold hover:underline"
          >
            {title ?? "All projects"}
          </Link>
          <p className="mt-0.5 truncate font-mono text-xs text-zinc-500">
            {workspaceId}
          </p>
        </div>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            aria-label="Hide sidebar"
            title="Hide sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function AppShell({
  workspaceId,
  title,
  children,
  sidebar,
  mobileTitle,
}: {
  workspaceId: string;
  title?: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  mobileTitle?: string;
}) {
  return (
    <WorkspaceLayoutProvider>
      <AppShellInner
        workspaceId={workspaceId}
        title={title}
        sidebar={sidebar}
        mobileTitle={mobileTitle}
      >
        {children}
      </AppShellInner>
    </WorkspaceLayoutProvider>
  );
}

function AppShellInner({
  workspaceId,
  title,
  children,
  sidebar,
  mobileTitle,
}: {
  workspaceId: string;
  title?: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  mobileTitle?: string;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { sidebarOpen, setSidebarOpen } = useWorkspaceLayout();

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

  return (
    <div className="flex min-h-screen flex-col lg:h-dvh lg:max-h-dvh lg:overflow-hidden lg:flex-row">
      <header className="flex items-center gap-2 border-b border-zinc-200 px-3 py-3 dark:border-zinc-800 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link
          href={`/workspace/${workspaceId}`}
          className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline"
        >
          {mobileTitle ?? title ?? "All projects"}
        </Link>
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
            <div className="flex items-center justify-between border-b border-zinc-200 p-3 dark:border-zinc-800">
              <span className="text-sm font-semibold">Navigation</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SidebarHeader workspaceId={workspaceId} title={title} />
              {sidebar}
            </div>
          </aside>
        </div>
      )}

      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:flex",
          sidebarOpen ? "w-64" : "w-10",
        )}
      >
        {sidebarOpen ? (
          <>
            <SidebarHeader
              workspaceId={workspaceId}
              title={title}
              onCollapse={() => setSidebarOpen(false)}
            />
            <div className="min-h-0 flex-1 overflow-y-auto">{sidebar}</div>
          </>
        ) : (
          <div className="flex flex-col items-center py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              aria-label="Show sidebar"
              title="Show sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}

export function ProjectListItem({
  href,
  title,
  status,
  pitch,
  active,
  onNavigate,
}: {
  href: string;
  title: string;
  status: string;
  pitch?: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "block border-b border-zinc-100 px-4 py-3 transition-colors dark:border-zinc-900",
        active
          ? "bg-zinc-100 dark:bg-zinc-900"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{title || "Generating..."}</span>
        <StatusBadge status={status} />
      </div>
      {pitch && (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{pitch}</p>
      )}
    </Link>
  );
}
