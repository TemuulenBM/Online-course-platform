import { Skeleton } from '@/components/ui/skeleton';

/**
 * Session card skeleton loader.
 * Grid дотор loading state-д ашиглана.
 */
export function SessionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white">
      <Skeleton className="aspect-video w-full" />
      <div className="p-5">
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="mb-4 h-5 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="mt-6 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Featured card skeleton */
export function FeaturedSessionCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-primary/20 bg-white md:flex-row">
      <Skeleton className="h-64 md:h-auto md:w-2/5" />
      <div className="flex flex-col justify-center p-8 md:w-3/5">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="mb-4 h-8 w-3/4" />
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
    </div>
  );
}
