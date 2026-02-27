'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Session timeline card skeleton loader.
 */
export function SessionTimelineSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary/5 bg-white p-5 md:flex-row md:items-center">
      {/* Огноо block */}
      <div className="flex items-center gap-5">
        <Skeleton className="size-14 rounded-xl" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-5 w-48 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex shrink-0 items-center gap-3 md:ml-auto">
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}
