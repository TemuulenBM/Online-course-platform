'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Нэг course card-ийн loading skeleton — шинэ Stitch layout-д тааруулсан */
export function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="w-full h-full rounded-none" />
        {/* Badge skeleton-ууд */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="absolute top-3 right-3 w-8 h-8 rounded-full" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        {/* Title */}
        <Skeleton className="h-5 w-4/5" />

        {/* Meta — avatar + нэр + duration */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>

        {/* Price + Arrow */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Grid-д зориулсан олон skeleton */
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
