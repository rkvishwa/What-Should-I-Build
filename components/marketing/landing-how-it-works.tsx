import { LandingSection } from "@/components/marketing/landing-section";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01",
    title: "Describe your context",
    description:
      "Share skills, GitHub, time available, career goals, or freeform context like a hackathon theme.",
    snippet: {
      label: "Input",
      lines: [
        "skills: React, Node, Supabase",
        "time: 1 weekend",
        "goal: portfolio piece",
      ],
    },
  },
  {
    step: "02",
    title: "Generate tailored ideas",
    description:
      "Get 3 or 5 project ideas with pitch, stack rationale, MVP scope, and phased roadmap.",
    snippet: {
      label: "Generating",
      lines: [
        "› idea 1/3 — closest match",
        "✓ pitch + stack rationale",
        "› roadmap in progress…",
      ],
    },
  },
  {
    step: "03",
    title: "Explore your workspace",
    description:
      "Each session becomes a workspace. Browse ranked projects and pick the idea worth building.",
    snippet: {
      label: "Workspace",
      lines: ["01 Habit stack for devs ★", "02 PR review copilot", "03 Bounty board"],
    },
  },
  {
    step: "04",
    title: "Ship with Agent, Canvas & MVP",
    description:
      "Generate AGENTS.md, edit the architecture canvas, preview the MVP, and refine via chat.",
    snippet: {
      label: "Artifacts",
      lines: ["AGENTS.md ✓", "Canvas ✓", "MVP preview →"],
    },
  },
];

export function LandingHowItWorks() {
  return (
    <LandingSection
      tone="dark"
      eyebrow="How it works"
      title="Four steps from stuck to shipping"
    >
      <div className="relative mt-16">
        <div
          className="absolute bottom-0 left-[1.35rem] top-0 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent sm:left-6"
          aria-hidden
        />

        <ol className="space-y-16 sm:space-y-20">
          {STEPS.map((item, index) => (
            <li
              key={item.step}
              className={cn(
                "relative grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-10 lg:grid-cols-[auto_1fr_minmax(0,280px)] lg:gap-12",
                index % 2 === 1 && "lg:[&>div:last-child]:order-first lg:[&>div:last-child]:text-right",
              )}
            >
              <div className="relative z-10 flex sm:justify-center">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-marketing-accent bg-marketing-accent-muted font-mono text-sm font-bold text-marketing-accent">
                  {item.step}
                </span>
              </div>

              <div className="min-w-0 pt-1">
                <h3 className="text-xl font-semibold text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-lg text-base leading-relaxed text-zinc-500">
                  {item.description}
                </p>
              </div>

              <div
                className={cn(
                  "font-mono text-[12px] leading-relaxed sm:max-w-xs lg:max-w-none",
                  index % 2 === 1 && "lg:ml-auto lg:text-right",
                )}
              >
                <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-600">
                  {item.snippet.label}
                </p>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                  {item.snippet.lines.map((line) => (
                    <p key={line} className="text-zinc-400">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </LandingSection>
  );
}
