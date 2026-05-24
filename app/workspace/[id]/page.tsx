"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/design-system/status-badge";
import { WorkspaceContext } from "@/components/workspace-attachments";
import { WorkspaceOverviewSkeleton } from "@/components/workspace/workspace-overview-skeleton";
import { Badge, Button } from "@/components/ui";
import type { FormInput } from "@/lib/schemas/form-input";
import type { Idea } from "@/lib/schemas/idea-output";
import type { IdeaOutput } from "@/lib/schemas/idea-output";
import { SummaryCallout } from "@/components/idea-card";

type ProjectRow = {
  id: string;
  status: string;
  rank: number;
  idea: Idea | null;
  agentMdStatus?: string;
  mvpStatus?: string;
};

type AttachmentRow = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
};

function ProjectCard({
  workspaceId,
  project,
}: {
  workspaceId: string;
  project: ProjectRow;
}) {
  const idea = project.idea as Idea | null;

  return (
    <Link
      href={`/workspace/${workspaceId}/projects/${project.id}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/50 sm:p-4"
    >
      <div className="flex gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {project.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="text-base font-semibold leading-snug group-hover:underline sm:text-lg">
              {idea?.title ?? "Generating..."}
            </h2>
            {idea?.ideaRole && <Badge>{idea.ideaRole}</Badge>}
            <StatusBadge status={project.status} className="ml-auto shrink-0" />
          </div>

          {idea?.pitch && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {idea.pitch}
            </p>
          )}

          {(idea?.stack.technologies?.length ||
            project.agentMdStatus === "ready" ||
            project.mvpStatus === "ready") && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {idea?.stack.technologies.map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
              {project.agentMdStatus === "ready" && <Badge>Agent ready</Badge>}
              {project.mvpStatus === "ready" && <Badge>MVP ready</Badge>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [workspaceStatus, setWorkspaceStatus] = useState("generating");
  const [seedIdea, setSeedIdea] = useState<string>();
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [generatingMore, setGeneratingMore] = useState(false);
  const [outputSummary, setOutputSummary] = useState<
    IdeaOutput["summary"] | null
  >(null);

  const refreshWorkspace = useCallback(() => {
    return fetch(`/api/workspaces/${workspaceId}`)
      .then((r) => r.json())
      .then(
        (data: {
          projects: ProjectRow[];
          workspace: {
            status: string;
            input: FormInput;
            outputSummary?: IdeaOutput["summary"] | null;
          };
          attachments: AttachmentRow[];
        }) => {
          setProjects(data.projects ?? []);
          setWorkspaceStatus(data.workspace?.status ?? "ready");
          const input = data.workspace?.input as FormInput;
          setSeedIdea(input?.seedIdea);
          setAttachments(data.attachments ?? []);
          setOutputSummary(data.workspace?.outputSummary ?? null);
        },
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => {
    setLoading(true);
    void refreshWorkspace();
  }, [refreshWorkspace]);

  async function generateAnother() {
    setGeneratingMore(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects`, {
        method: "POST",
      });
      const data = (await res.json()) as { projectId?: string };
      if (!data.projectId) throw new Error("Failed to create project");

      const source = new EventSource(
        `/api/workspaces/${workspaceId}/stream?projectId=${data.projectId}`,
      );

      source.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "project_ready" || parsed.type === "workspace_ready") {
          void refreshWorkspace();
        }
        if (parsed.type === "error") {
          console.error(parsed.message);
        }
      };

      source.onerror = () => {
        source.close();
        void refreshWorkspace();
        setGeneratingMore(false);
      };

      setTimeout(() => {
        source.close();
        void refreshWorkspace();
        setGeneratingMore(false);
      }, 120000);
    } catch {
      setGeneratingMore(false);
    }
  }

  const shouldRedirectToGenerating =
    workspaceStatus === "generating" &&
    projects.length > 0 &&
    projects.some((p) => p.status === "pending" || p.status === "generating");

  useEffect(() => {
    if (shouldRedirectToGenerating) {
      router.push(`/workspace/${workspaceId}/generating`);
    }
  }, [shouldRedirectToGenerating, workspaceId, router]);

  if (loading || shouldRedirectToGenerating) {
    return <WorkspaceOverviewSkeleton />;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 lg:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl">Your projects</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {projects.length} idea{projects.length !== 1 ? "s" : ""} in this workspace
          </p>
        </div>
        <Button
          type="button"
          onClick={generateAnother}
          disabled={generatingMore}
          className="w-full shrink-0 sm:w-auto"
        >
          {generatingMore ? "Generating..." : "Generate another idea"}
        </Button>
      </div>

      <div className="mt-5 space-y-5">
        <WorkspaceContext
          workspaceId={workspaceId}
          seedIdea={seedIdea}
          attachments={attachments}
        />

        {outputSummary && (
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCallout label="Best pick" value={outputSummary.bestPick} />
            <SummaryCallout
              label="Fastest to ship"
              value={outputSummary.fastestToShip}
            />
            <SummaryCallout
              label="Highest upside"
              value={outputSummary.highestUpside}
            />
          </div>
        )}

        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} workspaceId={workspaceId} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
