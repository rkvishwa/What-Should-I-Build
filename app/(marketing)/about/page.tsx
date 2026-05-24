import type { Metadata } from "next";
import { MarketingDarkShell } from "@/components/marketing/marketing-dark-shell";

export const metadata: Metadata = {
  title: "About — What Should I Build?",
  description:
    "Learn about What Should I Build — an AI project idea generator for developers who want actionable roadmaps, not vague brainstorms.",
};

export default function AboutPage() {
  return (
    <MarketingDarkShell>
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
          About
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          What Should I Build?
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-400">
          An AI project idea generator for developers who want actionable
          roadmaps, not vague brainstorms.
        </p>

        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-50">Our mission</h2>
          <p className="leading-relaxed text-zinc-400">
            Every developer hits the same wall: too many ideas, not enough
            clarity on what to build next. What Should I Build? turns your skills,
            constraints, and context into tailored project ideas with everything
            you need to start — stack rationale, MVP scope, phased roadmap, and
            monetization paths.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-50">What you get</h2>
          <ul className="list-inside list-disc space-y-2 text-zinc-400">
            <li>Ranked project ideas with pitch, stack, and fit rationale</li>
            <li>MVP scope with must-haves and cut-for-later lists</li>
            <li>Phased roadmap and monetization paths</li>
            <li>An interactive workspace with live generation logs</li>
            <li>Auto-generated architecture canvas with validation</li>
            <li>AGENTS.md instructions for AI coding tools</li>
            <li>Live MVP preview powered by v0</li>
            <li>Per-project chat to refine and explore</li>
          </ul>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-50">
            Who it&apos;s for
          </h2>
          <p className="leading-relaxed text-zinc-400">
            Indie hackers looking for their next side project. Hackathon teams
            who need ideas aligned to a theme and time constraint. Engineers
            exploring career pivots or learning new stacks. Anyone who wants to
            ship something real instead of endlessly scrolling for inspiration.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-50">
            How we&apos;re different
          </h2>
          <p className="leading-relaxed text-zinc-400">
            Most idea generators give you a text dump and send you on your way.
            We give you a workspace — editable architecture diagrams, agent
            instructions ready for Cursor, MVP previews you can click through, and
            chat grounded in your project context. It&apos;s the difference between
            a brainstorm and a build plan.
          </p>
        </section>
      </main>
    </MarketingDarkShell>
  );
}
