"use client";

import type { ValidationIssue } from "@/lib/schemas/canvas";
import { cn } from "@/lib/utils";

export function ValidationPanel({
  issues,
  onSelectNode,
  selectedNodeId,
}: {
  issues: ValidationIssue[];
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string;
}) {
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
        No issues detected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => (
        <button
          key={i}
          type="button"
          onClick={() => issue.nodeId && onSelectNode?.(issue.nodeId)}
          className={cn(
            "w-full rounded-lg border p-2 text-left text-sm transition-colors",
            issue.severity === "error" &&
              "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
            issue.severity === "warning" &&
              "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
            issue.severity === "info" &&
              "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900",
            issue.nodeId === selectedNodeId && "ring-2 ring-zinc-400",
            issue.nodeId && "cursor-pointer hover:opacity-80",
          )}
        >
          <span className="text-xs font-medium uppercase">{issue.severity}</span>
          <p className="mt-0.5">{issue.message}</p>
        </button>
      ))}
    </div>
  );
}
