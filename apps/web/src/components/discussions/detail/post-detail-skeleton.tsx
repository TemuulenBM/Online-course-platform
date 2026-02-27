'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Нийтлэлийн дэлгэрэнгүй skeleton */
export function PostDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Vote sidebar + card */}
      <div className="flex gap-6">
        <div className="hidden md:flex flex-col items-center gap-2">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-6 w-8" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
