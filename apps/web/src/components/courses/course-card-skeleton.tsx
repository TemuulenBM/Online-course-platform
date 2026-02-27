'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Нэг course card-ийн loading skeleton — шинэ дизайнд тааруулсан */
export function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-primary/5">
      {/* Thumbnail */}
      <Skeleton className="h-48 w-full rounded-none" />

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        {/* Түвшин + rating */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-4 w-10" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-4/5" />

        {/* Instructor */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 mt-1">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-10 rounded-md" />
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/5">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Grid-д зориулсан олон skeleton */
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
