'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Нэг элсэлтийн хэвтээ skeleton */
export function MyCourseCardSkeleton() {
  return (
    <div className="flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
      {/* Thumbnail */}
      <Skeleton className="w-[140px] h-[100px] rounded-xl shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="flex justify-end">
          <Skeleton className="h-4 w-10" />
        </div>
      </div>

      {/* Button */}
      <Skeleton className="w-[110px] h-10 rounded-full shrink-0" />
    </div>
  );
}

/** Олон skeleton-тэй жагсаалт */
export function MyCoursesListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MyCourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
