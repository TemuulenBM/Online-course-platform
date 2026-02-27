import { Skeleton } from '@/components/ui/skeleton';

/** Сертификатын дэлгэрэнгүй хуудасны бүтэн skeleton */
export function CertificateDetailSkeleton() {
  return (
    <div className="max-w-[1000px] w-full mx-auto flex flex-col gap-8 p-4 md:p-10">
      {/* PDF progress skeleton */}
      <Skeleton className="h-24 w-full rounded-xl" />

      {/* Certificate preview skeleton */}
      <Skeleton className="h-[500px] w-full rounded-xl" />

      {/* Info section skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}
