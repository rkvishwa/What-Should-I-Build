"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Share2 } from "lucide-react";
import type { FormInput } from "@/lib/schemas/form-input";
import type { IdeaOutput } from "@/lib/schemas/idea-output";
import { generationToMarkdown } from "@/lib/markdown";
import { IdeaCard, SummaryCallout } from "@/components/idea-card";
import { Button } from "@/components/ui";

type ResultsViewProps = {
  id: string;
  input: FormInput;
  output: IdeaOutput;
};

export function ResultsView({ id, input, output }: ResultsViewProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const markdown = generationToMarkdown(input, output);
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/r/${id}`;

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "What Should I Build?", url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  function saveAndRegenerate() {
    sessionStorage.setItem("wsib-last-input", JSON.stringify(input));
    window.location.href = "/dashboard/new";
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={copyMarkdown}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy as Markdown"}
        </Button>
        <Button type="button" variant="outline" onClick={shareLink}>
          <Share2 className="h-4 w-4" />
          {shared ? "Link copied" : "Share link"}
        </Button>
        <Button type="button" variant="ghost" onClick={saveAndRegenerate}>
          Generate again
        </Button>
        <Link
          href="/dashboard/new"
          className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          New search
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <p className="mb-2 font-medium">Your inputs</p>
        <dl className="grid gap-1 text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
          {input.skills?.length ? (
            <>
              <dt>Skills</dt>
              <dd>{input.skills.join(", ")}</dd>
            </>
          ) : null}
          {input.githubUsername ? (
            <>
              <dt>GitHub</dt>
              <dd>{input.githubUsername}</dd>
            </>
          ) : null}
          {input.timeAvailable ? (
            <>
              <dt>Time</dt>
              <dd>{input.timeAvailable}</dd>
            </>
          ) : null}
          {input.careerGoals ? (
            <>
              <dt>Career goals</dt>
              <dd>{input.careerGoals}</dd>
            </>
          ) : null}
          {input.context ? (
            <>
              <dt>Context</dt>
              <dd>{input.context}</dd>
            </>
          ) : null}
        </dl>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCallout label="Best pick" value={output.summary.bestPick} />
        <SummaryCallout
          label="Fastest to ship"
          value={output.summary.fastestToShip}
        />
        <SummaryCallout
          label="Highest upside"
          value={output.summary.highestUpside}
        />
      </div>

      <div className="space-y-6">
        {output.ideas
          .slice()
          .sort((a, b) => a.rank - b.rank)
          .map((idea) => (
            <IdeaCard key={idea.rank} idea={idea} />
          ))}
      </div>

      <p className="text-center text-xs text-zinc-500">
        Shareable link: {shareUrl}
      </p>
    </div>
  );
}
