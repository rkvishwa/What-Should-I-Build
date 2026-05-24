"use client";

import { useState } from "react";
import { Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

function ThinkingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-1.5 py-0.5", className)}
      aria-label="Thinking"
      role="status"
    >
      <span className="text-xs text-zinc-500">Thinking</span>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
          />
        ))}
      </span>
    </div>
  );
}

function isThinking(messages: Message[], loading: boolean) {
  if (!loading) return false;
  const last = messages[messages.length - 1];
  if (!last) return true;
  if (last.role === "user") return true;
  return last.role === "assistant" && !last.content.trim();
}

export function ProjectChat({
  projectId,
  initialMessages = [],
}: {
  projectId: string;
  initialMessages?: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: assistantText };
          return next;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:border-l lg:border-zinc-200 dark:lg:border-zinc-800">
      <div className="shrink-0 border-b border-zinc-200 p-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold">Refine this idea</h3>
        <p className="text-xs text-zinc-500">
          Ask questions, request changes, or explore the build plan.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500">
            Try: &quot;Make the MVP smaller&quot; or &quot;Add a payment flow to
            the architecture&quot;
          </p>
        )}
        {messages.map((msg, i) => {
          const thinking =
            loading &&
            i === messages.length - 1 &&
            msg.role === "assistant" &&
            !msg.content.trim();

          return (
            <div
              key={i}
              className={cn(
                "max-w-[92%] rounded-lg p-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "mr-auto bg-zinc-100 dark:bg-zinc-900",
              )}
            >
              {thinking ? <ThinkingIndicator /> : msg.content}
            </div>
          );
        })}
        {isThinking(messages, loading) &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="mr-auto max-w-[92%] rounded-lg bg-zinc-100 p-2.5 dark:bg-zinc-900">
              <ThinkingIndicator />
            </div>
          )}
      </div>

      <div className="shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this project..."
            className="min-h-[60px] flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
        </div>
        <Button
          type="button"
          className="mt-2 w-full"
          onClick={send}
          disabled={loading || !input.trim()}
        >
          {loading ? "Thinking..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
