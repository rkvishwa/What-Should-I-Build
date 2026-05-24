import { Skeleton } from "@/components/design-system/skeleton";

function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 sm:p-4">
      <div className="flex gap-3">
        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-2/3 max-w-xs" />
            <Skeleton className="ml-auto h-5 w-14 shrink-0 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceOverviewSkeleton() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 lg:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36 sm:h-8" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg sm:w-44" />
      </div>

      <div className="mt-5 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 sm:p-4">
        <Skeleton className="mb-3 h-4 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 sm:p-4"
          >
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
