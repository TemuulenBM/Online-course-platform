'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Нэг enrollment карт-ын skeleton */
function MyCourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm overflow-hidden flex flex-col sm:flex-row">
      {/* Thumbnail skeleton */}
      <div className="sm:w-48 h-48 sm:h-auto shrink-0">
        <Skeleton className="w-full h-full min-h-[140px]" />
      </div>
      {/* Content skeleton */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-6 w-3/4 rounded mt-1" />
          <Skeleton className="h-4 w-1/2 rounded mt-3" />
          <Skeleton className="h-1.5 w-full rounded-full mt-4" />
        </div>
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Grid skeleton — 4 карт */
export function MyCoursesListSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <MyCourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
