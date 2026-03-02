'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Admin Dashboard loading skeleton */
export function AdminDashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Pending skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center py-6">
                  <Skeleton className="h-10 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </div>
          {/* Health skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <Skeleton className="h-6 w-56 mb-6" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
        {/* Activity skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 mb-5">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
