"use client";

import { LogIn } from "lucide-react";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/design-system/skeleton";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  signInNext?: string;
  compact?: boolean;
};

export function UserMenu({
  signInNext = "/dashboard",
  compact = false,
}: UserMenuProps) {
  const { user, loading } = useAuthUser();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className={cn("space-y-3", compact && "flex justify-center")}>
        <div
          className={cn(
            "flex items-center gap-3",
            compact && "group-hover/sidebar:gap-3",
          )}
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton
            className={cn(
              "h-4 w-24",
              compact &&
                "hidden max-w-0 opacity-0 group-hover/sidebar:block group-hover/sidebar:max-w-none group-hover/sidebar:opacity-100",
            )}
          />
        </div>
        <Skeleton
          className={cn(
            "h-8 w-full rounded-md",
            compact &&
              "hidden max-h-0 opacity-0 group-hover/sidebar:block group-hover/sidebar:max-h-none group-hover/sidebar:opacity-100",
          )}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <a
        href={`/auth/login?next=${encodeURIComponent(signInNext)}`}
        className={cn(
          "inline-flex h-8 items-center justify-center rounded-md border border-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
          compact
            ? "w-8 px-0 group-hover/sidebar:w-auto group-hover/sidebar:px-3"
            : "px-3",
        )}
        title={compact ? "Sign in" : undefined}
      >
        {compact ? (
          <>
            <LogIn className="h-4 w-4 group-hover/sidebar:hidden" />
            <span className="hidden group-hover/sidebar:inline">Sign in</span>
          </>
        ) : (
          "Sign in"
        )}
      </a>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "Signed in";

  return (
    <div className={cn("space-y-3", compact && "flex flex-col items-center")}>
      <div
        className={cn(
          "flex min-w-0 items-center gap-3",
          compact && "justify-center group-hover/sidebar:justify-start",
        )}
        title={compact ? name : undefined}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span
          className={cn(
            "min-w-0 truncate text-sm text-zinc-600 dark:text-zinc-400",
            compact &&
              "hidden max-w-0 opacity-0 group-hover/sidebar:inline group-hover/sidebar:max-w-none group-hover/sidebar:opacity-100",
          )}
        >
          {name}
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        onClick={signOut}
        className={cn(
          "h-8 bg-white text-zinc-900 hover:bg-zinc-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100",
          compact
            ? "hidden w-0 max-w-0 overflow-hidden opacity-0 group-hover/sidebar:flex group-hover/sidebar:w-full group-hover/sidebar:max-w-none group-hover/sidebar:opacity-100"
            : "w-full",
        )}
      >
        Sign out
      </Button>
    </div>
  );
}
