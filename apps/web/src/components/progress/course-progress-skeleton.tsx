'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Course progress page skeleton */
export function CourseProgressSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 p-6 flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="size-40 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        </div>
        <Skeleton className="h-full min-h-[180px] rounded-xl" />
      </div>

      {/* Lesson list */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 p-6">
        <Skeleton className="h-5 w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-primary/5">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-2 w-full max-w-md rounded-full" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
