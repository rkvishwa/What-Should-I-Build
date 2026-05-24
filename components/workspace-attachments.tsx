"use client";

import { FileText } from "lucide-react";

type AttachmentRow = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
};

export function WorkspaceAttachments({
  workspaceId,
  attachments,
}: {
  workspaceId: string;
  attachments: AttachmentRow[];
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => {
        const url = `/api/workspaces/${workspaceId}/attachments/${attachment.id}`;
        const isImage = attachment.mimeType.startsWith("image/");

        return (
          <a
            key={attachment.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {isImage ? (
              <img
                src={url}
                alt=""
                className="h-6 w-6 shrink-0 rounded object-cover"
              />
            ) : (
              <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
            )}
            <span className="truncate font-medium">{attachment.filename}</span>
            <span className="shrink-0 text-xs text-zinc-500">
              {(attachment.size / 1024).toFixed(0)} KB
            </span>
          </a>
        );
      })}
    </div>
  );
}

export function SeedIdeaRecap({ seedIdea }: { seedIdea?: string }) {
  if (!seedIdea?.trim()) return null;

  return (
    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
      <span className="font-medium text-zinc-800 dark:text-zinc-200">Seed idea: </span>
      {seedIdea}
    </p>
  );
}

export function WorkspaceContext({
  workspaceId,
  seedIdea,
  attachments,
}: {
  workspaceId: string;
  seedIdea?: string;
  attachments: AttachmentRow[];
}) {
  if (!seedIdea?.trim() && attachments.length === 0) return null;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
      <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Starting context
      </h2>
      <div className="mt-2.5 space-y-3">
        <SeedIdeaRecap seedIdea={seedIdea} />
        <WorkspaceAttachments workspaceId={workspaceId} attachments={attachments} />
      </div>
    </section>
  );
}
