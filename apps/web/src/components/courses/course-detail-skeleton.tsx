'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Course detail хуудасны loading skeleton — шинэ grid layout */
export function CourseDetailSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <Skeleton className="h-5 w-48 rounded-lg" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Зүүн тал */}
          <div className="md:col-span-8 space-y-6">
            {/* Video hero */}
            <Skeleton className="aspect-video w-full rounded-2xl" />

            {/* Badge skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>

            {/* Title skeleton */}
            <Skeleton className="h-10 w-4/5" />

            {/* Instructor + rating skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-px" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Learning outcomes skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-6 border-b border-slate-200 dark:border-slate-700 pb-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* Баруун тал — Sidebar */}
          <div className="md:col-span-4 space-y-6">
            {/* Үнэ карт */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-primary/5 border border-primary/10 space-y-4">
              <Skeleton className="h-9 w-32" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>

            {/* Юу сурах вэ? карт */}
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
