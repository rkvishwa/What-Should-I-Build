import { AuthCta } from "@/components/marketing/auth-cta";
import { Bot, GitBranch, Layout, Sparkles, Zap } from "lucide-react";

const ARTIFACTS = [
  { icon: Layout, label: "AGENTS.md" },
  { icon: GitBranch, label: "Canvas" },
  { icon: Zap, label: "MVP preview" },
  { icon: Bot, label: "Agent chat" },
];

export function LandingCta() {
  return (
    <section className="relative border-t border-zinc-800/80 pb-28 pt-16 sm:pb-36 sm:pt-20">
      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
        <div className="mx-auto mb-10 inline-flex items-center gap-2 rounded-full border border-marketing-accent bg-marketing-accent-muted px-3 py-1.5 text-xs font-medium text-marketing-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Start building today
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {ARTIFACTS.map((artifact) => (
            <span
              key={artifact.label}
              className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500"
            >
              <artifact.icon className="h-3.5 w-3.5 text-marketing-accent" />
              {artifact.label}
            </span>
          ))}
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          Ready to find your next project?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">
          Sign in and create your first idea in minutes. Your workspace, canvas,
          and agent instructions are waiting.
        </p>
        <div className="mt-10 flex justify-center">
          <AuthCta size="lg" />
        </div>
      </div>
    </section>
  );
}
