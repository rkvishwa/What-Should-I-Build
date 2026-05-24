import Link from "next/link";
import { ArrowRight, FolderOpen, Plus } from "lucide-react";
import { getUserWorkspacesWithProjects, initDb } from "@/lib/db/queries";
import type { FormInput } from "@/lib/schemas/form-input";
import type { IdeaOutput } from "@/lib/schemas/idea-output";
import { StatusBadge } from "@/components/design-system/status-badge";
import { Card, buttonVariants } from "@/components/ui";
import { getUser } from "@/lib/auth/get-user";
import { cn } from "@/lib/utils";

function workspaceLabel(input: FormInput): string {
  if (input.seedIdea?.trim()) {
    const seed = input.seedIdea.trim();
    return seed.length > 72 ? `${seed.slice(0, 72)}…` : seed;
  }
  if (input.context?.trim()) {
    const ctx = input.context.trim();
    return ctx.length > 72 ? `${ctx.slice(0, 72)}…` : ctx;
  }
  if (input.skills?.length) {
    return `Skills: ${input.skills.slice(0, 3).join(", ")}`;
  }
  return "Project idea search";
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) return null;

  await initDb();
  const workspaces = await getUserWorkspacesWithProjects(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Your idea generation workspaces
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className={cn(buttonVariants(), "w-full shrink-0 sm:w-auto")}
        >
          <Plus className="h-4 w-4" />
          New search
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <FolderOpen className="h-5 w-5 text-zinc-500" />
          </div>
          <h2 className="mt-4 text-base font-medium">No sessions yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Start a new search to generate tailored project ideas with
            roadmaps and MVP scope.
          </p>
          <Link
            href="/dashboard/new"
            className={cn(buttonVariants(), "mt-6")}
          >
            <Plus className="h-4 w-4" />
            Generate ideas
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {workspaces.map(({ workspace, projectCount, projects }) => {
            const input = workspace.input as FormInput;
            const summary = workspace.outputSummary as
              | IdeaOutput["summary"]
              | null
              | undefined;
            const created = new Date(workspace.createdAt).toLocaleDateString(
              undefined,
              { month: "short", day: "numeric", year: "numeric" },
            );
            const readyCount = projects.filter(
              (p) => p.status === "ready",
            ).length;

            return (
              <li key={workspace.id}>
                <Link href={`/workspace/${workspace.id}`} className="group block">
                  <Card
                    className={cn(
                      "p-6 transition-colors",
                      "hover:border-zinc-300 hover:bg-zinc-50/50",
                      "dark:hover:border-zinc-700 dark:hover:bg-zinc-900/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-base font-medium leading-snug group-hover:text-zinc-900 dark:group-hover:text-zinc-50">
                          {workspaceLabel(input)}
                        </h2>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {created}
                          <span className="mx-2 text-zinc-300 dark:text-zinc-700">
                            ·
                          </span>
                          {projectCount} idea{projectCount !== 1 ? "s" : ""}
                          {readyCount > 0 && (
                            <>
                              <span className="mx-2 text-zinc-300 dark:text-zinc-700">
                                ·
                              </span>
                              {readyCount} ready
                            </>
                          )}
                        </p>
                        {summary?.bestPick && (
                          <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                              Best pick:
                            </span>{" "}
                            {summary.bestPick}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={workspace.status} />
                        <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500 dark:text-zinc-700 dark:group-hover:text-zinc-400" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
