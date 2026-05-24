"use client";

import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES } from "@/lib/schemas/attachment";

type FileUploadZoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
  uploadProgress?: number | null;
};

type PendingFile = {
  id: string;
  name: string;
  size: number;
  progress: number;
};

function ProgressBar({
  value,
  className,
  label = "Progress",
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const pct = Math.min(100, Math.max(0, value * 100));

  return (
    <div
      className={cn(
        "h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-zinc-900 transition-[width] duration-150 ease-out dark:bg-zinc-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function readFileWithProgress(
  file: File,
  onProgress: (value: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded / event.total);
      }
    };

    reader.onload = () => {
      onProgress(1);
      resolve();
    };

    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));

    onProgress(0);
    reader.readAsArrayBuffer(file);
  });
}

export function FileUploadZone({
  files,
  onChange,
  uploadProgress = null,
}: FileUploadZoneProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  async function addFiles(incoming: FileList | File[]) {
    const list = Array.from(incoming);
    if (list.length === 0) return;

    setIsAdding(true);
    const next = [...files];

    for (const file of list) {
      if (next.length >= MAX_ATTACHMENTS) break;
      if (file.size > MAX_ATTACHMENT_BYTES) continue;
      if (next.some((f) => f.name === file.name && f.size === file.size)) continue;

      const id = crypto.randomUUID();
      setPendingFiles((prev) => [
        ...prev,
        { id, name: file.name, size: file.size, progress: 0 },
      ]);

      try {
        await readFileWithProgress(file, (progress) => {
          setPendingFiles((prev) =>
            prev.map((item) => (item.id === id ? { ...item, progress } : item)),
          );
        });
        next.push(file);
        onChange(next.slice(0, MAX_ATTACHMENTS));
      } catch {
        // Skip unreadable files
      } finally {
        setPendingFiles((prev) => prev.filter((item) => item.id !== id));
      }
    }

    setIsAdding(false);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500",
          isAdding && "pointer-events-none opacity-70",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void addFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="mb-2 h-8 w-8 text-zinc-400" />
        <span className="text-sm font-medium">
          {isAdding ? "Adding files..." : "Drop files or click to upload"}
        </span>
        <span className="mt-1 text-xs text-zinc-500">
          Images, PDF, txt, md, json, csv — max {MAX_ATTACHMENTS} files, 5 MB each
        </span>
        <input
          type="file"
          className="hidden"
          multiple
          disabled={isAdding}
          accept="image/*,.txt,.md,.pdf,.json,.csv"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {pendingFiles.length > 0 && (
        <ul className="space-y-2">
          {pendingFiles.map((file) => (
            <li
              key={file.id}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 truncate">
                  <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {Math.round(file.progress * 100)}%
                </span>
              </div>
              <ProgressBar value={file.progress} className="mt-2" label={`Adding ${file.name}`} />
            </li>
          ))}
        </ul>
      )}

      {uploadProgress !== null && (
        <div className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-zinc-600 dark:text-zinc-400">Uploading files...</span>
            <span className="text-xs text-zinc-500">{Math.round(uploadProgress * 100)}%</span>
          </div>
          <ProgressBar value={uploadProgress} className="mt-2" label="Uploading files" />
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <span className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                {file.name}
                <span className="text-xs text-zinc-500">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label={`Remove ${file.name}`}
                disabled={uploadProgress !== null}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
