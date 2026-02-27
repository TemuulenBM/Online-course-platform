import { Skeleton } from '@/components/ui/skeleton';

/** Сертификат картын skeleton — 2-col grid-д 4 ширхэг */
export function CertificateCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-6"
        >
          <div className="flex-1 space-y-4">
            <div>
              <Skeleton className="h-3 w-32 mb-2" />
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="w-full sm:w-40 aspect-[4/3] rounded-lg" />
        </div>
      ))}
    </div>
  );
}
