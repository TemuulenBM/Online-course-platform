'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Нэг мэдэгдлийн skeleton */
export function NotificationItemSkeleton({
  variant = 'compact',
}: {
  variant?: 'compact' | 'full';
}) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={
        isCompact
          ? 'flex items-start gap-3 px-4 py-3'
          : 'flex items-start gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800'
      }
    >
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/** Олон skeleton-тэй жагсаалт */
export function NotificationsListSkeleton({
  count = 5,
  variant = 'compact',
}: {
  count?: number;
  variant?: 'compact' | 'full';
}) {
  return (
    <div className={variant === 'full' ? 'flex flex-col gap-2' : ''}>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationItemSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
