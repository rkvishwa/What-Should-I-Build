import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultsView } from "@/components/results-view";
import { getGeneration } from "@/lib/db/queries";
import type { FormInput } from "@/lib/schemas/form-input";
import type { IdeaOutput } from "@/lib/schemas/idea-output";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const generation = await getGeneration(id);

  if (!generation) {
    return { title: "Not found — What Should I Build?" };
  }

  const output = generation.output as IdeaOutput;
  const topIdea = output.ideas.find((idea) => idea.rank === 1);

  return {
    title: topIdea
      ? `${topIdea.title} — What Should I Build?`
      : "Project ideas — What Should I Build?",
    description: topIdea?.pitch ?? "AI-generated project ideas for developers.",
  };
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const generation = await getGeneration(id);

  if (!generation) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← What Should I Build?
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Your project ideas
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Three tailored ideas with roadmap, stack, MVP scope, and monetization.
          <span className="block mt-1 text-xs text-zinc-500">
            Legacy view — new generations use the interactive workspace.
          </span>
        </p>
      </header>

      <ResultsView
        id={id}
        input={generation.input as FormInput}
        output={generation.output as IdeaOutput}
      />
    </main>
  );
}
