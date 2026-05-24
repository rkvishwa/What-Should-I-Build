"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Idea } from "@/lib/schemas/idea-output";
import type { CanvasData } from "@/lib/schemas/canvas";
import { IdeaCard } from "@/components/idea-card";
import { ProjectChat } from "@/components/project-chat";
import { ProjectAgentMd } from "@/components/project-agent-md";
import { ProjectMvpPreview } from "@/components/project-mvp-preview";
import { TabNav } from "@/components/design-system/app-shell";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const ProjectCanvas = dynamic(
  () =>
    import("@/components/canvas/project-canvas").then((m) => m.ProjectCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center p-8">
        Loading canvas...
      </div>
    ),
  },
);

type ProjectTab =
  | "overview"
  | "agent"
  | "canvas"
  | "mvp"
  | "chat";

const PROJECT_TABS: { id: ProjectTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "agent", label: "Agent" },
  { id: "canvas", label: "Canvas" },
  { id: "mvp", label: "MVP" },
  { id: "chat", label: "Chat" },
];

export function ProjectDetailTabs({
  workspaceId,
  idea,
  projectId,
  projectStatus,
  canvas,
  messages,
  agentMd,
  agentMdStatus,
  agentMdError,
  mvpStatus,
  mvpDemoUrl,
  mvpWebUrl,
  mvpPreviewHtml,
  mvpSource,
  mvpError,
}: {
  workspaceId: string;
  idea: Idea;
  projectId: string;
  projectStatus: string;
  canvas: CanvasData | null;
  messages: { role: "user" | "assistant"; content: string }[];
  agentMd: string | null;
  agentMdStatus: string;
  agentMdError: string | null;
  mvpStatus: string;
  mvpDemoUrl: string | null;
  mvpWebUrl: string | null;
  mvpPreviewHtml: string | null;
  mvpSource: string | null;
  mvpError: string | null;
}) {
  const [tab, setTab] = useState<ProjectTab>("overview");
  const [canvasData, setCanvasData] = useState<CanvasData | null>(canvas);
  const [generatingCanvas, setGeneratingCanvas] = useState(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [currentAgentMdStatus, setCurrentAgentMdStatus] =
    useState(agentMdStatus);
  const [currentAgentMd, setCurrentAgentMd] = useState(agentMd);
  const [currentMvpStatus, setCurrentMvpStatus] = useState(mvpStatus);

  const generateCanvas = useCallback(
    async (force = false) => {
      if (generatingCanvas) return;
      if (!force && canvasData) return;

      setGeneratingCanvas(true);
      setCanvasError(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/generate-canvas`,
          { method: "POST" },
        );
        const data = (await response.json()) as {
          canvas?: CanvasData;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Canvas generation failed");
        }

        if (data.canvas) {
          setCanvasData(data.canvas);
        }
      } catch (error) {
        setCanvasError(
          error instanceof Error ? error.message : "Canvas generation failed",
        );
      } finally {
        setGeneratingCanvas(false);
      }
    },
    [canvasData, generatingCanvas, projectId],
  );

  useEffect(() => {
    if (tab === "canvas" && !canvasData && !generatingCanvas && !canvasError) {
      void generateCanvas(false);
    }
  }, [tab, canvasData, generatingCanvas, canvasError, generateCanvas]);

  const isOverviewTab = tab === "overview";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className={
          isOverviewTab
            ? "shrink-0 border-b border-zinc-200 px-3 py-3 dark:border-zinc-800 sm:px-4"
            : "shrink-0 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800 sm:px-4"
        }
      >
        {isOverviewTab ? (
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <TabNav
              tabs={PROJECT_TABS}
              active={tab}
              onChange={(id) => setTab(id as ProjectTab)}
              className="order-first self-end border-b-0 lg:order-last lg:shrink-0 lg:self-start"
            />
            <div className="order-last min-w-0 flex-1 lg:order-first">
              <Link
                href={`/workspace/${workspaceId}`}
                className="hidden text-sm font-medium text-zinc-600 hover:underline lg:inline dark:text-zinc-400"
              >
                ← All projects
              </Link>
              <div className="mt-0 flex flex-wrap items-center gap-x-2 gap-y-1 lg:mt-2">
                <h1 className="text-lg font-bold leading-snug sm:text-xl">
                  {idea.title}
                </h1>
                {idea.ideaRole && <Badge>{idea.ideaRole}</Badge>}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {idea.pitch}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {idea.stack.technologies.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
                {currentAgentMdStatus === "ready" && <Badge>Agent ready</Badge>}
                {currentMvpStatus === "ready" && <Badge>MVP ready</Badge>}
                {currentMvpStatus === "generating" && (
                  <Badge>Generating MVP</Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <TabNav
              tabs={PROJECT_TABS}
              active={tab}
              onChange={(id) => setTab(id as ProjectTab)}
              className="order-first self-end border-b-0 lg:order-last lg:-mb-px"
            />
            <h1 className="order-last truncate text-base font-semibold sm:text-lg lg:order-first">
              {idea.title}
            </h1>
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {tab === "overview" && (
          <div className="absolute inset-0 overflow-y-auto px-3 py-4 sm:px-4 lg:px-5">
            <IdeaCard idea={idea} showHeader={false} defaultSectionsOpen />
          </div>
        )}
        {tab === "agent" && (
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            <ProjectAgentMd
              projectId={projectId}
              agentMd={currentAgentMd}
              agentMdStatus={currentAgentMdStatus}
              agentMdError={agentMdError}
              onUpdated={(md) => {
                setCurrentAgentMd(md);
                setCurrentAgentMdStatus("ready");
              }}
            />
          </div>
        )}
        {tab === "canvas" && (
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            {canvasData ? (
              <ProjectCanvas projectId={projectId} initialCanvas={canvasData} />
            ) : generatingCanvas ? (
              <div className="flex min-h-0 flex-1 items-center justify-center text-zinc-500">
                Generating architecture canvas...
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-8 text-zinc-500">
                <p>{canvasError ?? "Canvas not yet generated"}</p>
                {projectStatus === "failed" && (
                  <p className="text-sm text-amber-600">
                    This project failed during generation. You can retry below.
                  </p>
                )}
                <Button
                  type="button"
                  onClick={() => void generateCanvas(true)}
                >
                  {canvasError ? "Retry canvas generation" : "Generate canvas"}
                </Button>
              </div>
            )}
          </div>
        )}
        {tab === "chat" && (
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            <ProjectChat projectId={projectId} initialMessages={messages} />
          </div>
        )}
        <div
          className={cn(
            "absolute inset-0 flex flex-col overflow-hidden bg-white dark:bg-zinc-950",
            tab === "mvp"
              ? "z-10"
              : "pointer-events-none invisible z-0",
          )}
        >
          <ProjectMvpPreview
            projectId={projectId}
            isActive={tab === "mvp"}
            agentMdStatus={currentAgentMdStatus}
            initialMvp={{
              mvpStatus,
              mvpDemoUrl,
              mvpWebUrl,
              mvpPreviewHtml,
              mvpSource,
              mvpError,
              agentMdStatus: currentAgentMdStatus,
            }}
            onAgentMdNeeded={() => setTab("agent")}
            onStatusChange={setCurrentMvpStatus}
          />
        </div>
      </div>
    </div>
  );
}
