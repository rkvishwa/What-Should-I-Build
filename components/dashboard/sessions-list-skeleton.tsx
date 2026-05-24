import { Card } from "@/components/ui";
import { Skeleton } from "@/components/design-system/skeleton";

function SessionCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4 max-w-sm" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
      </div>
    </Card>
  );
}

export function SessionsListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SessionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
