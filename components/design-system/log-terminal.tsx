"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type LogEntry = {
  message: string;
  level?: "info" | "warn" | "error";
  timestamp?: Date;
};

export function LogTerminal({
  logs,
  className,
}: {
  logs: LogEntry[];
  className?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div
      className={cn(
        "overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300",
        className,
      )}
    >
      {logs.length === 0 && (
        <p className="text-zinc-500">Waiting for logs...</p>
      )}
      {logs.map((log, i) => (
        <div
          key={i}
          className={cn(
            "py-0.5",
            log.level === "error" && "text-red-400",
            log.level === "warn" && "text-amber-400",
          )}
        >
          <span className="text-zinc-600">
            {log.timestamp
              ? log.timestamp.toLocaleTimeString()
              : new Date().toLocaleTimeString()}
          </span>{" "}
          {log.message}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
