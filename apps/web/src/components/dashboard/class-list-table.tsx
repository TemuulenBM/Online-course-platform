'use client';

import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMyEnrollments } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

/** Статус badge-ийн өнгө */
const statusStyles = {
  active: 'bg-[#EAF3EB] text-[#507D5D]',
  completed: 'bg-[#EAF0FC] text-[#5D8FFC]',
  cancelled: 'bg-red-50 text-red-500',
  expired: 'bg-gray-100 text-gray-500',
} as const;

const statusDotStyles = {
  active: 'bg-[#507D5D]',
  completed: 'bg-[#5D8FFC]',
  cancelled: 'bg-red-400',
  expired: 'bg-gray-400',
} as const;

export function ClassListTable() {
  const t = useTranslations('dashboard');
  const tp = useTranslations('profile');

  const { data: enrollments, isLoading } = useMyEnrollments({ page: 1, limit: 5 });

  const items = enrollments?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{t('myClassList')}</h3>
        <Link
          href={ROUTES.MY_COURSES}
          className="text-sm font-semibold text-gray-500 bg-white border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
        >
          {t('seeAll')}
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/3 rounded-lg" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">{tp('noEnrollments')}</p>
            <Link
              href={ROUTES.COURSES}
              className="text-sm font-bold text-[#8A93E5] hover:text-[#7B8AD4] transition-colors"
            >
              {tp('browseCourses')}
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 capitalize w-1/2">
                  {t('classColumn')}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 capitalize w-1/4">
                  {t('progressColumn')}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-400 capitalize w-1/4">
                  {t('statusColumn')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((enrollment) => {
                const status = enrollment.status;
                const progressPercent = status === 'completed' ? 100 : 0;
                return (
                  <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        href={
                          enrollment.courseSlug
                            ? ROUTES.COURSE_DETAIL(enrollment.courseSlug)
                            : ROUTES.COURSES
                        }
                        className="flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 overflow-hidden">
                          {enrollment.courseThumbnailUrl ? (
                            <Image
                              src={enrollment.courseThumbnailUrl}
                              alt={enrollment.courseTitle ?? ''}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-[15px] mb-0.5 group-hover:text-[#8A93E5] transition-colors">
                            {enrollment.courseTitle ?? 'Untitled Course'}
                          </span>
                          {enrollment.courseInstructorName && (
                            <span className="text-xs text-gray-500 font-medium">
                              {enrollment.courseInstructorName}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-gray-700">
                          {progressPercent}% {t('finish')}
                        </span>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-[#A78BFA] rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 ${statusStyles[status] ?? statusStyles.active} px-3 py-1 rounded-full text-[11px] font-bold`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusDotStyles[status] ?? statusDotStyles.active}`}
                        />
                        {status === 'active' && t('onProgress')}
                        {status === 'completed' && t('completed')}
                        {status === 'cancelled' && t('notStarted')}
                        {status === 'expired' && t('notStarted')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
