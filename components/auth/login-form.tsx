"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error");
  const [loading, setLoading] = useState<"github" | "google" | null>(null);
  const [error, setError] = useState<string | null>(
    authError === "auth_failed" ? "Sign in failed. Please try again." : null,
  );

  async function signIn(provider: "github" | "google") {
    setLoading(provider);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(null);
    }
  }

  return (
    <>
      <div className="space-y-3 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={loading !== null}
          onClick={() => signIn("github")}
        >
          {loading === "github" ? "Redirecting..." : "Continue with GitHub"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full"
          disabled={loading !== null}
          onClick={() => signIn("google")}
        >
          {loading === "google" ? "Redirecting..." : "Continue with Google"}
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
    </>
  );
}
