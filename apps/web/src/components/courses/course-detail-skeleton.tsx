'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Course detail хуудасны loading skeleton — Stitch layout */
export function CourseDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Breadcrumb */}
      <Skeleton className="h-5 w-48 rounded-lg" />

      <div className="flex flex-col xl:flex-row gap-8 max-w-6xl">
        {/* Зүүн тал */}
        <div className="flex-1 flex flex-col gap-4 max-w-[800px]">
          {/* Video hero */}
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <Skeleton className="w-full h-full rounded-none" />
            {/* Play товч skeleton */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-16 h-16 rounded-full" />
            </div>
            {/* Preview badge skeleton */}
            <Skeleton className="absolute bottom-4 left-4 h-7 w-28 rounded-lg" />
          </div>

          {/* Badge skeleton */}
          <div className="flex gap-2 mt-1">
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>

          {/* Title skeleton */}
          <Skeleton className="h-9 w-4/5" />

          {/* Meta skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-6 mt-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>

          {/* Content skeleton */}
          <div className="flex flex-col gap-3 mt-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Баруун тал — Sidebar */}
        <div className="w-full xl:w-[320px] shrink-0">
          <div className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            {/* Үнэ */}
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* Товчнууд */}
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            {/* Separator */}
            <div className="border-t border-slate-100 dark:border-slate-800" />
            {/* Includes */}
            <Skeleton className="h-4 w-36" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            {/* Separator */}
            <div className="border-t border-slate-100 dark:border-slate-800" />
            {/* Instructor */}
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
