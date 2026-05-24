"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, ProjectListItem } from "@/components/design-system/app-shell";
import type { Idea } from "@/lib/schemas/idea-output";
import { cn } from "@/lib/utils";

type ProjectRow = {
  id: string;
  status: string;
  idea: Idea | null;
};

export function WorkspaceShell({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    function load() {
      fetch(`/api/workspaces/${workspaceId}`)
        .then((r) => r.json())
        .then((data: { projects: ProjectRow[] }) => {
          setProjects(data.projects ?? []);
        })
        .catch(console.error);
    }
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  const activeProjectId = pathname.match(/projects\/([^/]+)/)?.[1];
  const isOverview = pathname === `/workspace/${workspaceId}`;
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const mobileTitle =
    (activeProject?.idea as Idea | null)?.title ?? undefined;

  return (
    <AppShell
      workspaceId={workspaceId}
      title="All projects"
      mobileTitle={mobileTitle}
      sidebar={
        <div>
          <Link
            href={`/workspace/${workspaceId}`}
            className={cn(
              "block border-b border-zinc-100 px-4 py-3 text-sm font-medium transition-colors dark:border-zinc-900",
              isOverview
                ? "bg-zinc-100 dark:bg-zinc-900"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
            )}
          >
            Overview
          </Link>
          <p className="px-4 py-2 text-xs font-medium uppercase text-zinc-500">
            Projects
          </p>
          {projects.map((project) => {
            const idea = project.idea as Idea | null;
            return (
              <ProjectListItem
                key={project.id}
                href={`/workspace/${workspaceId}/projects/${project.id}`}
                title={idea?.title ?? "Generating..."}
                pitch={idea?.pitch}
                status={project.status}
                active={activeProjectId === project.id}
              />
            );
          })}
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
