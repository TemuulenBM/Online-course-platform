'use client';

import Link from 'next/link';
import { useMyEnrollments } from '@/hooks/api/use-enrollments';
import { useMyCertificates } from '@/hooks/api/use-certificates';
import { ROUTES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseProgressCard() {
  const { data: enrollments, isLoading: loadingEnrollments } = useMyEnrollments({
    page: 1,
    limit: 100,
  });
  const { data: certificates, isLoading: loadingCerts } = useMyCertificates({
    page: 1,
    limit: 1,
  });

  const isLoading = loadingEnrollments || loadingCerts;

  if (isLoading) {
    return <ProgressSkeleton />;
  }

  const totalEnrollments = enrollments?.total ?? 0;
  const completedCount = certificates?.total ?? 0;
  const progressPercentage =
    totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0;

  return (
    <div className="bg-[#9c7aff] rounded-3xl p-8 text-white shadow-xl shadow-[#9c7aff]/20 relative overflow-hidden">
      <div className="relative z-10">
        <h4 className="text-xl font-bold mb-2">Сургалтын явц</h4>
        <p className="text-white/70 text-sm mb-6">
          Та нийт сургалтынхаа {progressPercentage}%-ийг амжилттай дүүргэсэн байна.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mb-6">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <Link
          href={ROUTES.MY_COURSES}
          className="block w-full py-3 bg-white text-[#9c7aff] font-bold rounded-xl hover:bg-slate-50 transition-colors text-center"
        >
          Дэлгэрэнгүй
        </Link>
      </div>

      {/* Decorative blur */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
    </div>
  );
}

/** Loading skeleton */
function ProgressSkeleton() {
  return (
    <div className="bg-[#9c7aff]/20 rounded-3xl p-8">
      <Skeleton className="h-6 w-36 mb-3" />
      <Skeleton className="h-4 w-full mb-6" />
      <Skeleton className="h-3 w-full rounded-full mb-6" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
