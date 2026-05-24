"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LogTerminal, type LogEntry } from "@/components/design-system/log-terminal";
import { StatusBadge } from "@/components/design-system/status-badge";
import { Card } from "@/components/ui";
import { takeWorkspaceFiles } from "@/lib/client/pending-workspace-uploads";

type ProjectSlot = {
  projectId: string;
  status: string;
  title?: string;
};

function uploadWorkspaceAttachments(
  workspaceId: string,
  files: File[],
  onProgress: (value: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    for (const file of files) {
      fd.append("files", file);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/workspaces/${workspaceId}/attachments`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText) as { error?: string };
        reject(new Error(data.error ?? "File upload failed"));
      } catch {
        reject(new Error("File upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("File upload failed"));
    xhr.send(fd);
  });
}

function logEntry(message: string, level?: LogEntry["level"]): LogEntry {
  return { message, level, timestamp: new Date() };
}

export default function GeneratingPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [logs, setLogs] = useState<LogEntry[]>([
    logEntry("Setting up your workspace..."),
  ]);
  const [projects, setProjects] = useState<ProjectSlot[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appendLog = useCallback((message: string, level?: LogEntry["level"]) => {
    setLogs((prev) => [...prev, logEntry(message, level)]);
  }, []);

  const syncFromWorkspace = useCallback(
    (data: {
      projects: { id: string; status: string; idea?: { title?: string } | null }[];
      workspace: { status: string };
    }) => {
      setProjects(
        (data.projects ?? []).map((p) => ({
          projectId: p.id,
          status: p.status,
          title: (p.idea as { title?: string } | null)?.title,
        })),
      );

      if (data.workspace?.status === "ready") {
        setTimeout(() => router.push(`/workspace/${workspaceId}`), 800);
      } else if (data.workspace?.status === "failed") {
        setError("Generation failed");
      }
    },
    [router, workspaceId],
  );

  const pollWorkspace = useCallback(() => {
    fetch(`/api/workspaces/${workspaceId}`)
      .then((r) => r.json())
      .then(syncFromWorkspace)
      .catch(console.error);
  }, [workspaceId, syncFromWorkspace]);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        syncFromWorkspace(data);
        setInitialLoadDone(true);
      })
      .catch(console.error);
  }, [workspaceId, syncFromWorkspace]);

  useEffect(() => {
    let cancelled = false;

    async function prepareGeneration() {
      const pendingFiles = takeWorkspaceFiles(workspaceId);

      if (pendingFiles.length === 0) {
        setStreamReady(true);
        return;
      }

      appendLog(`Uploading ${pendingFiles.length} file(s)...`);
      setUploadProgress(0);

      try {
        await uploadWorkspaceAttachments(workspaceId, pendingFiles, (progress) => {
          if (!cancelled) {
            setUploadProgress(progress);
          }
        });

        if (cancelled) return;

        setUploadProgress(null);
        appendLog("Files uploaded — starting generation...");
        setStreamReady(true);
      } catch (err) {
        if (cancelled) return;
        setUploadProgress(null);
        setError(err instanceof Error ? err.message : "File upload failed");
      }
    }

    void prepareGeneration();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, appendLog]);

  useEffect(() => {
    const pollInterval = setInterval(pollWorkspace, 3000);
    return () => clearInterval(pollInterval);
  }, [pollWorkspace]);

  useEffect(() => {
    if (!streamReady) return;

    function connect() {
      sourceRef.current?.close();
      const source = new EventSource(`/api/workspaces/${workspaceId}/stream`);
      sourceRef.current = source;

      source.onmessage = (event) => {
        const data = JSON.parse(event.data) as {
          type: string;
          message?: string;
          level?: "info" | "warn" | "error";
          projectId?: string;
          status?: string;
          title?: string;
        };

        switch (data.type) {
          case "log":
            setLogs((prev) => {
              const message = data.message ?? "";
              if (prev.some((entry) => entry.message === message)) {
                return prev;
              }
              return [...prev, logEntry(message, data.level)];
            });
            break;
          case "project_status":
            setProjects((prev) => {
              const existing = prev.find((p) => p.projectId === data.projectId);
              if (existing) {
                return prev.map((p) =>
                  p.projectId === data.projectId
                    ? {
                        ...p,
                        status: data.status ?? p.status,
                        title: data.title ?? p.title,
                      }
                    : p,
                );
              }
              return [
                ...prev,
                {
                  projectId: data.projectId!,
                  status: data.status ?? "pending",
                  title: data.title,
                },
              ];
            });
            break;
          case "project_ready":
            setProjects((prev) =>
              prev.map((p) =>
                p.projectId === data.projectId
                  ? { ...p, status: "ready", title: data.title }
                  : p,
              ),
            );
            break;
          case "workspace_ready":
            setTimeout(() => router.push(`/workspace/${workspaceId}`), 800);
            break;
          case "generation_in_progress":
            pollWorkspace();
            break;
          case "error":
            setError(data.message ?? "Generation failed");
            break;
        }
      };

      source.onerror = () => {
        source.close();
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      sourceRef.current?.close();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [workspaceId, router, pollWorkspace, streamReady]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 lg:px-5">
      <h1 className="text-xl font-bold sm:text-2xl">Generating your projects</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
        Thinking, creating architecture, and building design systems...
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {!initialLoadDone ? (
          <Card className="col-span-full p-4 text-sm text-zinc-500">
            Loading projects...
          </Card>
        ) : projects.length === 0 ? (
          <Card className="col-span-full p-4 text-sm text-zinc-500">
            Waiting for projects...
          </Card>
        ) : (
          projects.map((project, i) => (
            <Card key={project.projectId} className="p-4">
              <p className="text-xs text-zinc-500">Project {i + 1}</p>
              <p className="mt-1 truncate font-medium">
                {project.title ?? "Waiting..."}
              </p>
              <StatusBadge status={project.status} className="mt-2" />
            </Card>
          ))
        )}
      </div>

      {uploadProgress !== null && (
        <div className="mt-5 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-600 dark:text-zinc-400">Uploading files...</span>
            <span className="text-xs text-zinc-500">
              {Math.round(uploadProgress * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-900 transition-[width] duration-150 ease-out dark:bg-zinc-100"
              style={{ width: `${Math.round(uploadProgress * 100)}%` }}
            />
          </div>
        </div>
      )}

      <LogTerminal logs={logs} className="mt-5 h-64 sm:h-80" />

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
