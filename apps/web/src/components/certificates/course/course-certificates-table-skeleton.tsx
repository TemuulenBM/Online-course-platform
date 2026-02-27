import { Skeleton } from '@/components/ui/skeleton';

/** Сургалтын сертификатуудын хүснэгтийн skeleton */
export function CourseCertificatesTableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary/5 border-b border-primary/10">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-primary/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-28 rounded" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
