'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Lesson Viewer хуудасны loading skeleton */
export function LessonViewerSkeleton() {
  return (
    <main className="flex-1 flex flex-col overflow-y-auto">
      {/* Breadcrumb */}
      <nav className="px-4 py-8 lg:px-10 max-w-5xl mx-auto w-full">
        <Skeleton className="h-4 w-64 mb-6" />
      </nav>

      <div className="max-w-5xl mx-auto w-full px-4 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Title + badge */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            {/* Content area */}
            <Skeleton className="h-96 w-full rounded-xl" />
            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Skeleton className="h-12 w-32 rounded-xl" />
              <Skeleton className="h-12 w-36 rounded-xl" />
            </div>
          </div>
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
