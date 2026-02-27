import { Skeleton } from '@/components/ui/skeleton';

/** Баталгаажуулалтын үр дүнгийн skeleton */
export function VerifyResultSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-7 w-44 rounded-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
