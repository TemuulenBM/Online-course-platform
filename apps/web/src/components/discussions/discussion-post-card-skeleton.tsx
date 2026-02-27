'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Нийтлэл картны loading skeleton */
export function DiscussionPostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      {/* Title */}
      <Skeleton className="h-5 w-3/4 mb-3" />
      {/* Author + tags */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      {/* Stats */}
      <div className="flex items-center gap-5">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );
}
