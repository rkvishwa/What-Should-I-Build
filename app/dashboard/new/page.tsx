import type { Metadata } from "next";
import { IdeaForm } from "@/components/idea-form";

export const metadata: Metadata = {
  title: "New search — What Should I Build?",
  description:
    "Create a new project idea — describe your skills, context, and goals to generate tailored ideas.",
};

export default function NewSearchPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          New search
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Describe what you&apos;re looking for
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Share your skills, goals, or context — we&apos;ll generate tailored
          project ideas with roadmaps, stacks, and MVP scope.
        </p>
      </div>

      <IdeaForm />
    </div>
  );
}
