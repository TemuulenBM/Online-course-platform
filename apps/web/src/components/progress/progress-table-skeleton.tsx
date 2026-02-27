'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Progress courses table skeleton */
export function ProgressTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-primary/5">
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Table header */}
      <div className="px-6 py-3 border-b border-primary/5 grid grid-cols-6 gap-4">
        <Skeleton className="h-3 w-24 col-span-2" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Rows */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 border-b border-primary/5 grid grid-cols-6 gap-4 items-center"
        >
          <div className="flex items-center gap-3 col-span-2">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
          <div>
            <Skeleton className="h-2 w-full rounded-full mb-1" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
