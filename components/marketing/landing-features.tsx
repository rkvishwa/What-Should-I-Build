import {
  Bot,
  FileUp,
  GitBranch,
  Layout,
  MessageSquare,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import { LandingSection } from "@/components/marketing/landing-section";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Tailored idea generation",
    description:
      "3 ideas from profile or context. Add a seed or uploads for 5.",
  },
  {
    icon: FileUp,
    title: "Seed idea + file uploads",
    description: "Anchor with a concept or images, PDFs, and docs.",
  },
  {
    icon: Bot,
    title: "Agentic & AI toggles",
    description: "Build with coding agents or AI inside the product.",
  },
  {
    icon: Terminal,
    title: "Live generation logs",
    description: "Phased SSE logs — no black box.",
  },
  {
    icon: Workflow,
    title: "Interactive workspace",
    description: "Ranked projects, attachments, status tracking.",
  },
  {
    icon: GitBranch,
    title: "Architecture canvas",
    description: "React Flow diagrams with validation.",
  },
  {
    icon: Layout,
    title: "AGENTS.md generation",
    description: "Agent instructions for Cursor and more.",
  },
  {
    icon: Zap,
    title: "v0 MVP preview",
    description: "Live UI preview before you write code.",
  },
  {
    icon: MessageSquare,
    title: "Per-project chat",
    description: "Streaming chat with full project context.",
  },
];

const LOG_LINES = [
  { status: "done", text: "Parsing skills + GitHub profile" },
  { status: "done", text: "Generating idea 1/3 — closest match" },
  { status: "active", text: "Generating idea 2/3 — variation" },
  { status: "pending", text: "Roadmap + monetization paths" },
];

export function LandingFeatures() {
  return (
    <LandingSection
      id="features"
      tone="dark"
      eyebrow="Features"
      title="From brainstorm to build-ready artifacts"
      description="Not just a list of ideas — a full workspace with architecture, agent instructions, MVP previews, and chat."
    >
      <div className="mt-16 grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">
                workspace · wsib-a3f2
              </span>
            </div>

            <div className="border-b border-zinc-800 p-4 font-mono text-[12px] leading-relaxed sm:p-5 sm:text-[13px]">
              {LOG_LINES.map((line) => (
                <div
                  key={line.text}
                  className="flex items-start gap-2 py-0.5"
                >
                  <span
                    className={
                      line.status === "done"
                        ? "text-emerald-500"
                        : line.status === "active"
                          ? "text-marketing-accent"
                          : "text-zinc-600"
                    }
                  >
                    {line.status === "done"
                      ? "✓"
                      : line.status === "active"
                        ? "›"
                        : "·"}
                  </span>
                  <span
                    className={
                      line.status === "pending"
                        ? "text-zinc-600"
                        : "text-zinc-300"
                    }
                  >
                    {line.text}
                    {line.status === "active" && (
                      <span className="ml-0.5 inline-block animate-pulse text-marketing-accent">
                        _
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid gap-px bg-zinc-800 sm:grid-cols-3">
              {[
                { rank: "01", title: "Habit stack for devs", active: true },
                { rank: "02", title: "PR review copilot", active: false },
                { rank: "03", title: "Bounty board", active: false },
              ].map((idea) => (
                <div
                  key={idea.rank}
                  className={`px-4 py-3 ${idea.active ? "bg-zinc-900" : "bg-zinc-950"}`}
                >
                  <span
                    className={`inline-flex font-mono text-[10px] ${idea.active ? "text-marketing-accent" : "text-zinc-600"}`}
                  >
                    {idea.rank}
                  </span>
                  <p
                    className={`mt-1 text-xs font-medium ${idea.active ? "text-zinc-100" : "text-zinc-500"}`}
                  >
                    {idea.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-4 -right-4 hidden rounded-lg border border-marketing-accent bg-zinc-950 px-3 py-2 shadow-lg sm:block">
            <p className="font-mono text-[9px] uppercase tracking-widest text-marketing-accent">
              Output
            </p>
            <p className="mt-0.5 text-xs font-semibold text-zinc-200">
              3 ideas · roadmap · stack
            </p>
          </div>
        </div>

        <ul className="divide-y divide-zinc-800/80">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="group flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              <feature.icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-marketing-accent" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  {feature.title}
                </h3>
                <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </LandingSection>
  );
}
