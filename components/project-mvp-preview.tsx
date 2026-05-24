"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/design-system/skeleton";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type MvpState = {
  mvpStatus: string;
  mvpDemoUrl: string | null;
  mvpWebUrl: string | null;
  mvpPreviewHtml: string | null;
  mvpSource: string | null;
  mvpError: string | null;
  agentMdStatus: string;
};

function MvpPreviewSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800 sm:px-4">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="ml-2 h-4 flex-1 max-w-xs rounded-md" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
            <Skeleton className="h-7 w-2/3 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-5/6 max-w-md" />
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="mt-auto h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabPanelMessage({
  title,
  description,
  action,
  tone = "default",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center sm:px-6">
      <p
        className={cn(
          "max-w-md text-sm",
          tone === "error"
            ? "text-red-600 dark:text-red-400"
            : "text-zinc-600 dark:text-zinc-400",
        )}
      >
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-xs text-zinc-500">{description}</p>
      )}
      {action}
    </div>
  );
}

export function ProjectMvpPreview({
  projectId,
  initialMvp,
  agentMdStatus,
  isActive,
  onAgentMdNeeded,
  onStatusChange,
}: {
  projectId: string;
  initialMvp: MvpState;
  agentMdStatus: string;
  isActive: boolean;
  onAgentMdNeeded?: () => void;
  onStatusChange?: (status: string) => void;
}) {
  const [mvpStatus, setMvpStatus] = useState(initialMvp.mvpStatus);
  const [demoUrl, setDemoUrl] = useState(initialMvp.mvpDemoUrl);
  const [webUrl, setWebUrl] = useState(initialMvp.mvpWebUrl);
  const [previewHtml, setPreviewHtml] = useState(initialMvp.mvpPreviewHtml);
  const [mvpSource, setMvpSource] = useState(initialMvp.mvpSource);
  const [error, setError] = useState(initialMvp.mvpError);
  const [generating, setGenerating] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const generateRequestRef = useRef<Promise<void> | null>(null);
  const hasRequestedGenerationRef = useRef(
    initialMvp.mvpStatus === "generating" ||
      initialMvp.mvpStatus === "ready" ||
      Boolean(initialMvp.mvpDemoUrl) ||
      Boolean(initialMvp.mvpPreviewHtml),
  );

  const hasPreview = Boolean(demoUrl || previewHtml);

  const syncMvpStatus = useCallback(
    (status: string) => {
      setMvpStatus(status);
      onStatusChange?.(status);
    },
    [onStatusChange],
  );

  const applyProjectMvp = useCallback(
    (project: {
      mvpStatus?: string;
      mvpDemoUrl?: string | null;
      mvpWebUrl?: string | null;
      mvpPreviewHtml?: string | null;
      mvpSource?: string | null;
      mvpError?: string | null;
    }) => {
      const nextStatus = project.mvpStatus ?? "idle";
      const nextDemoUrl = project.mvpDemoUrl ?? null;
      const nextWebUrl = project.mvpWebUrl ?? null;
      const nextPreviewHtml = project.mvpPreviewHtml ?? null;
      const nextSource = project.mvpSource ?? null;
      const nextError = project.mvpError ?? null;

      if (nextStatus === "generating" || nextDemoUrl || nextPreviewHtml) {
        hasRequestedGenerationRef.current = true;
      }

      setMvpStatus((prev) => {
        let resolved = nextStatus;
        if (prev === "ready" && nextStatus === "generating" && nextDemoUrl) {
          resolved = "ready";
        } else if (
          hasRequestedGenerationRef.current &&
          prev === "generating" &&
          nextStatus === "idle"
        ) {
          resolved = "generating";
        }
        onStatusChange?.(resolved);
        return resolved;
      });
      setDemoUrl(nextDemoUrl);
      setWebUrl(nextWebUrl);
      setPreviewHtml(nextPreviewHtml);
      setMvpSource(nextSource);
      setError(nextError);
      if (nextStatus !== "generating") {
        setGenerating(false);
      }
    },
    [onStatusChange],
  );

  const pollStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = (await response.json()) as {
        project?: {
          mvpStatus?: string;
          mvpDemoUrl?: string | null;
          mvpWebUrl?: string | null;
          mvpPreviewHtml?: string | null;
          mvpSource?: string | null;
          mvpError?: string | null;
        };
      };
      if (data.project) {
        applyProjectMvp(data.project);
      }
    } catch {
      // ignore poll errors
    }
  }, [applyProjectMvp, projectId]);

  const generateMvp = useCallback(
    async (force = false) => {
      if (generateRequestRef.current && !force) return;
      if (!force && mvpStatus === "ready" && (demoUrl || previewHtml)) return;

      if (agentMdStatus !== "ready") {
        onAgentMdNeeded?.();
        return;
      }

      hasRequestedGenerationRef.current = true;
      setGenerating(true);
      setError(null);
      syncMvpStatus("generating");
      if (force) {
        setDemoUrl(null);
        setWebUrl(null);
        setPreviewHtml(null);
        setMvpSource(null);
      }

      const request = (async () => {
        try {
          const url = force
            ? `/api/projects/${projectId}/generate-mvp?force=1`
            : `/api/projects/${projectId}/generate-mvp`;
          const response = await fetch(url, { method: "POST" });
          const data = (await response.json()) as {
            demoUrl?: string;
            webUrl?: string;
            previewHtml?: string;
            mvpSource?: string;
            mvpStatus?: string;
            error?: string;
          };

          if (response.status === 202) {
            syncMvpStatus("generating");
            return;
          }

          if (!response.ok) {
            if (response.status === 409) {
              syncMvpStatus("generating");
              await pollStatus();
              return;
            }
            throw new Error(data.error ?? "MVP generation failed");
          }

          setDemoUrl(data.demoUrl ?? null);
          setWebUrl(data.webUrl ?? null);
          setPreviewHtml(data.previewHtml ?? null);
          setMvpSource(data.mvpSource ?? null);
          syncMvpStatus(data.mvpStatus ?? "ready");
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "MVP generation failed";
          if (err instanceof TypeError) {
            syncMvpStatus("generating");
            await pollStatus();
            return;
          }
          setError(message);
          syncMvpStatus("failed");
        } finally {
          setGenerating(false);
          generateRequestRef.current = null;
        }
      })();

      generateRequestRef.current = request;
      await request;
    },
    [
      agentMdStatus,
      demoUrl,
      mvpStatus,
      onAgentMdNeeded,
      pollStatus,
      previewHtml,
      projectId,
      syncMvpStatus,
    ],
  );

  useEffect(() => {
    setIframeLoaded(false);
  }, [demoUrl, previewHtml, isActive]);

  useEffect(() => {
    let cancelled = false;
    void pollStatus().finally(() => {
      if (!cancelled) {
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, pollStatus]);

  useEffect(() => {
    if (mvpStatus !== "generating") return;
    void pollStatus();
    const interval = setInterval(() => void pollStatus(), 3000);
    return () => clearInterval(interval);
  }, [mvpStatus, pollStatus]);

  useEffect(() => {
    if (
      !hydrated ||
      !isActive ||
      hasRequestedGenerationRef.current ||
      mvpStatus !== "idle" ||
      demoUrl ||
      previewHtml ||
      generating ||
      agentMdStatus !== "ready"
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void generateMvp(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    hydrated,
    isActive,
    mvpStatus,
    demoUrl,
    previewHtml,
    generating,
    agentMdStatus,
    generateMvp,
  ]);

  if (agentMdStatus !== "ready") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TabPanelMessage
          title="Agent instructions must be ready before generating an MVP preview."
          action={
            <Button type="button" onClick={onAgentMdNeeded}>
              Open Agent tab
            </Button>
          }
        />
      </div>
    );
  }

  const showLoading =
    generating || (mvpStatus === "generating" && !hasPreview);

  if (showLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800 sm:px-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Generating MVP preview...
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Uses v0 when available, otherwise your configured LLM.
          </p>
        </div>
        <MvpPreviewSkeleton />
      </div>
    );
  }

  if (mvpStatus === "failed" || (!hasPreview && error)) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TabPanelMessage
          tone="error"
          title={error ?? "MVP generation failed"}
          action={
            <Button type="button" onClick={() => void generateMvp(true)}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!hasPreview) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TabPanelMessage
          title="No MVP preview yet."
          action={
            <Button type="button" onClick={() => void generateMvp(true)}>
              Generate MVP preview
            </Button>
          }
        />
      </div>
    );
  }

  const previewLabel =
    mvpSource === "llm"
      ? "Preview generated with your LLM (v0 limit reached)"
      : "Live preview powered by v0";
  const openPreviewHref = demoUrl ?? `/api/projects/${projectId}/mvp-preview`;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-col gap-2 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-sm text-zinc-500">{previewLabel}</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={openPreviewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open preview
          </a>
          {webUrl && (
            <a
              href={webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in v0
            </a>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void generateMvp(true)}
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 bg-white dark:bg-zinc-950">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/40">
            <p className="text-sm text-zinc-500">Loading preview...</p>
          </div>
        )}
        {isActive ? (
          demoUrl ? (
            <iframe
              key={demoUrl}
              src={demoUrl}
              title="MVP preview"
              onLoad={() => setIframeLoaded(true)}
              className="block h-full min-h-[480px] w-full border-0 bg-white"
            />
          ) : previewHtml ? (
            <iframe
              key={previewHtml.slice(0, 120)}
              srcDoc={previewHtml}
              title="MVP preview"
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="block h-full min-h-[480px] w-full border-0 bg-white"
            />
          ) : null
        ) : null}
      </div>
    </div>
  );
}
