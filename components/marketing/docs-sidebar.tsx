"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "getting-started", label: "Getting started" },
  { id: "idea-intake", label: "Idea intake" },
  { id: "workspace", label: "Workspace" },
  { id: "project-tabs", label: "Project tabs" },
  { id: "environment", label: "Environment variables" },
  { id: "limits", label: "Limits" },
];

export function DocsSidebar() {
  return (
    <nav className="sticky top-20 space-y-1 text-sm">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
        On this page
      </p>
      {SECTIONS.map((section) => (
        <Link
          key={section.id}
          href={`#${section.id}`}
          className="block rounded-md px-2 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}

export function DocsMobileNav() {
  function jumpToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${sectionId}`);
    }
  }

  return (
    <div className="lg:hidden">
      <label htmlFor="docs-section-nav" className="mb-2 block text-xs font-medium text-zinc-500">
        Jump to section
      </label>
      <select
        id="docs-section-nav"
        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200"
        defaultValue=""
        onChange={(event) => {
          const value = event.target.value;
          if (value) {
            jumpToSection(value);
            event.target.value = "";
          }
        }}
      >
        <option value="" disabled>
          Select a section…
        </option>
        {SECTIONS.map((section) => (
          <option key={section.id} value={section.id}>
            {section.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DocsSection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <h2 className="text-lg font-semibold text-zinc-50 sm:text-xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-400">
        {children}
      </div>
    </section>
  );
}
