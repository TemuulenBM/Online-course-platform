'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Оюутнуудын хүснэгтийн skeleton */
export function StudentsTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-primary/10">
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <Skeleton className="h-3 w-20 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-40 rounded" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-24 rounded" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-24 rounded" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-5 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
