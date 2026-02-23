'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Lesson Viewer хуудасны loading skeleton */
export function LessonViewerSkeleton() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 p-6 lg:p-8">
      {/* Зүүн тал */}
      <div className="flex-1 flex flex-col gap-6 max-w-[800px]">
        {/* Видео area */}
        <Skeleton className="aspect-video w-full rounded-2xl" />

        {/* Гарчиг */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        {/* Mark complete */}
        <Skeleton className="h-10 w-48 rounded-xl" />

        {/* Comments */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full rounded-xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Баруун sidebar */}
      <div className="w-full xl:w-[380px] shrink-0">
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 p-5 gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex flex-col gap-2 mt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
