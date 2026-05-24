"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { cn } from "@/lib/utils";

type AuthCtaProps = {
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function AuthCta({ size = "default", className }: AuthCtaProps) {
  const { user, loading } = useAuthUser();

  if (loading) {
    return (
      <div
        className={cn(
          "inline-flex h-10 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800",
          className,
        )}
      />
    );
  }

  const href = user ? "/dashboard" : "/auth/login?next=/dashboard";
  const label = user ? "Dashboard" : "Sign in";

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ size }), className)}
    >
      {label}
    </Link>
  );
}
