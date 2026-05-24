import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
          Sign in required
        </p>
        <h1 className="text-3xl font-bold tracking-tight">What Should I Build?</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Sign in to open your dashboard and generate project ideas.
        </p>
      </div>

      <Suspense>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
