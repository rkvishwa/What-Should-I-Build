"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

const STALE_GENERATING_MS = 2 * 60 * 1000;
const LONG_GENERATING_MS = 30 * 1000;

export function ProjectAgentMd({
  projectId,
  agentMd,
  agentMdStatus,
  agentMdError,
  onUpdated,
}: {
  projectId: string;
  agentMd: string | null;
  agentMdStatus: string;
  agentMdError: string | null;
  onUpdated?: (agentMd: string) => void;
}) {
  const [content, setContent] = useState(agentMd);
  const [status, setStatus] = useState(agentMdStatus);
  const [error, setError] = useState(agentMdError);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingSince, setGeneratingSince] = useState<number | null>(null);
  const autoStartedRef = useRef(false);

  useEffect(() => {
    setContent(agentMd);
    setStatus(agentMdStatus);
    setError(agentMdError);
    if (agentMdStatus === "generating") {
      setGeneratingSince((prev) => prev ?? Date.now());
    } else {
      setGeneratingSince(null);
    }
  }, [agentMd, agentMdStatus, agentMdError]);

  const pollProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = (await response.json()) as {
        project?: {
          agentMd?: string | null;
          agentMdStatus?: string;
          agentMdError?: string | null;
          updatedAt?: string;
        };
      };
      if (!data.project) return;

      if (data.project.agentMdStatus) {
        setStatus(data.project.agentMdStatus);
      }
      if (data.project.agentMd) {
        setContent(data.project.agentMd);
      }
      if (data.project.agentMdError) {
        setError(data.project.agentMdError);
      }

      if (
        data.project.agentMdStatus === "ready" &&
        data.project.agentMd
      ) {
        setGeneratingSince(null);
        onUpdated?.(data.project.agentMd);
      }
    } catch {
      // ignore poll errors
    }
  }, [projectId, onUpdated]);

  useEffect(() => {
    if (status !== "generating") return;
    const interval = setInterval(() => void pollProject(), 3000);
    return () => clearInterval(interval);
  }, [status, pollProject]);

  const generate = useCallback(
    async (force = false) => {
      if (generating) return;
      if (!force && status === "ready" && content) return;

      setGenerating(true);
      setError(null);
      setStatus("generating");
      setGeneratingSince(Date.now());

      try {
        const response = await fetch(
          `/api/projects/${projectId}/generate-agent-md`,
          { method: "POST" },
        );
        const data = (await response.json()) as {
          agentMd?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Agent MD generation failed");
        }

        if (data.agentMd) {
          setContent(data.agentMd);
          setStatus("ready");
          setGeneratingSince(null);
          onUpdated?.(data.agentMd);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Agent MD generation failed";
        setError(message);
        setStatus("failed");
        setGeneratingSince(null);
      } finally {
        setGenerating(false);
      }
    },
    [content, generating, onUpdated, projectId, status],
  );

  useEffect(() => {
    if (autoStartedRef.current) return;

    const isStaleGenerating =
      status === "generating" &&
      generatingSince !== null &&
      Date.now() - generatingSince > STALE_GENERATING_MS;

    if (status === "pending" || isStaleGenerating) {
      autoStartedRef.current = true;
      void generate(true);
    }
  }, [status, generatingSince, generate]);

  async function copyMarkdown() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadMarkdown() {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AGENTS.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  const showLongWait =
    (status === "generating" || generating) &&
    generatingSince !== null &&
    Date.now() - generatingSince > LONG_GENERATING_MS;

  if (status === "pending" || (!content && status !== "generating" && !generating)) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-zinc-500">
          Agent instructions not yet generated for this idea.
        </p>
        <Button type="button" onClick={() => void generate(true)} disabled={generating}>
          {generating ? "Generating..." : "Generate AGENTS.md"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  if (status === "generating" || generating) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-zinc-500">
        <p>Writing agent instructions...</p>
        {showLongWait && (
          <>
            <p className="text-sm">This is taking longer than expected.</p>
            <Button type="button" onClick={() => void generate(true)}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </>
        )}
        </div>
      </div>
    );
  }

  if (status === "failed" && !content) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-600">{error ?? "Agent MD generation failed"}</p>
        <Button type="button" onClick={() => void generate(true)}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <Button type="button" variant="outline" size="sm" onClick={copyMarkdown}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={downloadMarkdown}>
          <Download className="h-4 w-4" />
          Download .md
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void generate(true)}
          disabled={generating}
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {content}
        </pre>
      </div>
    </div>
  );
}
