'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Lesson Viewer хуудасны loading skeleton — шинэ layout */
export function LessonViewerSkeleton() {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto">
      {/* Breadcrumb header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <Skeleton className="h-5 w-64" />
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Video area */}
        <Skeleton className="aspect-video w-full rounded-2xl" />

        {/* Metadata + navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-3">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>

        {/* Content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-8">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
