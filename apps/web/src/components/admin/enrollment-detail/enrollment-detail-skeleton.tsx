'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Admin enrollment detail хуудасны skeleton */
export function EnrollmentDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Зүүн багана */}
      <div className="lg:col-span-2 space-y-6">
        {/* Profile card skeleton */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10">
          <div className="flex gap-6 items-center">
            <Skeleton className="size-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10">
            <Skeleton className="h-3 w-24 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10">
            <Skeleton className="h-3 w-24 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        {/* Activity log skeleton */}
        <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Баруун багана */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10">
          <Skeleton className="h-3 w-24 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10">
          <Skeleton className="h-3 w-32 mb-6" />
          <Skeleton className="h-10 w-full rounded-xl mb-4" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
