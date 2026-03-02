'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Stat card-ийн skeleton */
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/10">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="size-12 rounded-xl" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

/** Chart-ийн skeleton */
export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-primary/5">
      <div className="flex justify-between mb-6">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="flex items-end justify-between h-64 gap-2 px-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${30 + Math.random() * 50}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Хүснэгтийн skeleton */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 overflow-hidden">
      <div className="p-4 border-b border-primary/10">
        <Skeleton className="h-4 w-48" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-primary/5">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Хуудасны бүрэн skeleton */
export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Chart */}
      <ChartSkeleton />
    </div>
  );
}
