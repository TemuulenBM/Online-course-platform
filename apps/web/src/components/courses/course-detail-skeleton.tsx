'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Course detail хуудасны loading skeleton */
export function CourseDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <Skeleton className="h-5 w-48 rounded-lg" />
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Зүүн тал */}
        <div className="flex-1 flex flex-col gap-6 max-w-[800px]">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-64" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        {/* Баруун тал */}
        <div className="w-full xl:w-[320px] shrink-0">
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
