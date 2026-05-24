"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Idea } from "@/lib/schemas/idea-output";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

function Section({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex w-full items-center gap-3 px-3 py-3 text-left sm:px-4"
        aria-expanded={open ? "true" : "false"}
      >
        <span className="min-w-0 flex-1 text-sm font-medium">{title}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors group-hover:border-zinc-300 group-hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:group-hover:border-zinc-600 dark:group-hover:bg-zinc-800">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-zinc-200 px-3 pb-4 pt-3 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:px-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function StaticSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:p-4",
        className,
      )}
    >
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </section>
  );
}

export function IdeaCard({
  idea,
  showHeader = true,
  defaultSectionsOpen = false,
}: {
  idea: Idea;
  showHeader?: boolean;
  defaultSectionsOpen?: boolean;
}) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {showHeader && (
        <Card className="overflow-hidden">
          <div className="p-3 sm:p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                {idea.rank}
              </span>
              <h3 className="min-w-0 text-base font-semibold sm:text-lg">{idea.title}</h3>
              {idea.ideaRole && <Badge>{idea.ideaRole}</Badge>}
            </div>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {idea.pitch}
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <StaticSection title="Why it fits">{idea.whyItFits}</StaticSection>

        <StaticSection title="Stack">
          <div className="mb-3 flex flex-wrap gap-2">
            {idea.stack.technologies.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
          <p>{idea.stack.rationale}</p>
        </StaticSection>
      </div>

      <Section title="MVP scope" defaultOpen={defaultSectionsOpen}>
        <p className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Must have</p>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          {idea.mvpScope.mustHave.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mb-2 font-medium text-zinc-800 dark:text-zinc-200">Cut for later</p>
        <ul className="list-disc space-y-1 pl-5">
          {idea.mvpScope.cutForLater.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Roadmap" defaultOpen={defaultSectionsOpen}>
        <div className="space-y-4">
          {idea.roadmap.map((phase) => (
            <div key={phase.phase}>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">{phase.phase}</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {phase.goals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid gap-3 lg:grid-cols-2">
        <Section title="Monetization" defaultOpen={defaultSectionsOpen}>
          <ul className="list-disc space-y-1 pl-5">
            {idea.monetization.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title="Meta notes" defaultOpen={defaultSectionsOpen}>
          <p>{idea.metaNotes}</p>
        </Section>
      </div>
    </div>
  );
}

export function SummaryCallout({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4",
        className,
      )}
    >
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="text-sm leading-snug">{value}</p>
    </div>
  );
}
