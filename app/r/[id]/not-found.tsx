import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold">Result not found</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        This generation may have expired or the link is invalid.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Generate new ideas
      </Link>
    </main>
  );
}
