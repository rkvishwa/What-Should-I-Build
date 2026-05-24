import {
  Bot,
  GitBranch,
  Layout,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

const IDEAS = [
  {
    rank: "01",
    title: "Habit stack for devs",
    pitch: "CLI + dashboard that ties commits to daily goals — ship streaks, not guilt.",
    tags: ["Next.js", "Supabase", "1 weekend"],
    role: "Closest match",
    active: true,
    className:
      "left-0 top-0 z-30 rotate-0 scale-100 opacity-100 border-zinc-200/90 shadow-[0_8px_32px_-8px_rgb(0_0_0_/_0.12)] dark:border-zinc-700/80 dark:shadow-[0_8px_32px_-8px_rgb(0_0_0_/_0.35)]",
  },
  {
    rank: "02",
    title: "PR review copilot",
    pitch: "Summarize diffs and suggest tests before you open the review thread.",
    tags: ["TypeScript", "AI in product"],
    role: "Variation",
    active: false,
    className:
      "left-6 top-6 z-20 rotate-[2.5deg] scale-[0.97] opacity-75 border-zinc-200/80 dark:border-zinc-700/80",
  },
  {
    rank: "03",
    title: "Open-source bounty board",
    pitch: "Match maintainers with builders who have exactly your stack and timeline.",
    tags: ["React", "Stripe"],
    role: "Adjacent",
    active: false,
    className:
      "left-12 top-12 z-10 rotate-[5deg] scale-[0.94] opacity-50 border-zinc-200/80 dark:border-zinc-700/80",
  },
];

const ARTIFACTS = [
  { icon: Layout, label: "AGENTS.md" },
  { icon: GitBranch, label: "Canvas" },
  { icon: Zap, label: "MVP preview" },
  { icon: Bot, label: "Agent chat" },
];

export function LandingHeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:pl-4">
      <div className="relative z-40 mb-4 flex items-start justify-between gap-3">
        <div className="hidden -translate-x-2 items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur-sm sm:inline-flex lg:translate-x-0 dark:border-zinc-700/80 dark:bg-zinc-950/80 dark:text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-marketing-accent/60" />
          3 ideas generated
        </div>

        <div className="ml-auto shrink-0 rounded-lg border border-zinc-200/80 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-950/90">
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
            <Terminal className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="animate-pulse text-zinc-600 dark:text-zinc-300">generating</span>
            <span className="hidden text-zinc-400 sm:inline">idea 3/3…</span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto h-[15rem] max-w-md sm:h-[18.5rem] lg:mx-0 lg:max-w-none">
        {IDEAS.map((idea) => (
          <article
            key={idea.rank}
            className={`absolute w-[calc(100%-1.5rem)] max-w-sm rounded-xl border bg-white/90 p-4 shadow-xl backdrop-blur-md sm:w-[calc(100%-3rem)] sm:p-5 dark:bg-zinc-950/90 ${idea.className} ${idea.active ? "animate-hero-card-float" : ""}`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold ${
                    idea.active
                      ? "border-marketing-accent/15 bg-marketing-accent-muted/25 text-marketing-accent/65"
                      : "border-zinc-200/80 bg-zinc-100/80 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300"
                  }`}
                >
                  {idea.rank}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                    {idea.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {idea.role}
                  </p>
                </div>
              </div>
              {idea.active && (
                <span className="shrink-0 rounded-full border border-zinc-200/80 bg-zinc-100/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400">
                  Selected
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {idea.pitch}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {idea.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-zinc-200/80 bg-zinc-100/80 px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="relative z-40 mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ARTIFACTS.map((artifact) => (
          <div
            key={artifact.label}
            className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2.5 backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-950/80"
          >
            <artifact.icon className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {artifact.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
