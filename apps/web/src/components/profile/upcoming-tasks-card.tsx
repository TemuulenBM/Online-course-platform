'use client';

import { BookOpen, Inbox, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useMyEnrollments } from '@/hooks/api/use-enrollments';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

/** Идэвхтэй сургалтуудыг "ойрын даалгавар" маягаар харуулна */
export function UpcomingTasksCard() {
  const { data, isLoading } = useMyEnrollments({ status: 'active' as any, limit: 3 });

  if (isLoading) {
    return <TasksSkeleton />;
  }

  const enrollments = data?.data ?? [];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#9c7aff]/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-900">Идэвхтэй сургалтууд</h4>
        {enrollments.length > 0 && (
          <Link
            href={ROUTES.MY_COURSES}
            className="text-[#9c7aff] hover:bg-[#9c7aff]/10 p-1 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Link>
        )}
      </div>

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
          <Inbox className="w-8 h-8 mb-2" />
          <p className="text-sm">Идэвхтэй сургалт одоогоор байхгүй</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={
                enrollment.courseSlug
                  ? ROUTES.COURSE_DETAIL(enrollment.courseSlug)
                  : ROUTES.MY_COURSES
              }
              className="flex gap-4 items-start group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#9c7aff]/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#9c7aff]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-[#9c7aff] transition-colors">
                  {enrollment.courseTitle ?? 'Сургалт'}
                </p>
                <p className="text-xs text-slate-400">
                  Элссэн: {new Date(enrollment.enrolledAt).toLocaleDateString('mn-MN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Loading skeleton */
function TasksSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-[#9c7aff]/5 shadow-sm">
      <Skeleton className="h-5 w-36 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-start">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
