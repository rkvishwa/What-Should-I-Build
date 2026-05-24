import { Skeleton } from "@/components/design-system/skeleton";

export function NewSearchSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-4 w-4/5 max-w-sm" />
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        <Skeleton className="h-48 w-full rounded-xl" />

        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>

        <Skeleton className="h-64 w-full rounded-xl" />

        <Skeleton className="h-11 w-44 rounded-lg" />
      </div>
    </div>
  );
}
