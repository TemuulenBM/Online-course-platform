'use client';

import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMyEnrollments } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ROUTES } from '@/lib/constants';

/** Статус badge-ийн өнгө */
const statusStyles = {
  active: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-500',
  expired: 'bg-muted text-muted-foreground',
} as const;

const statusDotStyles = {
  active: 'bg-green-700',
  completed: 'bg-blue-600',
  cancelled: 'bg-red-400',
  expired: 'bg-muted-foreground',
} as const;

export function ClassListTable() {
  const t = useTranslations('dashboard');
  const tp = useTranslations('profile');

  const { data: enrollments, isLoading } = useMyEnrollments({ page: 1, limit: 5 });

  const items = enrollments?.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{t('myClassList')}</h2>
        <Link
          href={ROUTES.MY_COURSES}
          className="text-sm font-semibold text-muted-foreground bg-card border border-border px-4 py-1.5 rounded-full hover:bg-muted transition-colors"
        >
          {t('seeAll')}
        </Link>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] overflow-hidden">
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
          <EmptyState
            icon={BookOpen}
            title={tp('noEnrollments')}
            action={{ label: tp('browseCourses'), href: ROUTES.COURSES }}
            className="py-12"
          />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground capitalize w-1/2">
                  {t('classColumn')}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground capitalize w-1/4">
                  {t('progressColumn')}
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground capitalize w-1/4">
                  {t('statusColumn')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((enrollment) => {
                const status = enrollment.status;
                const progressPercent = status === 'completed' ? 100 : 0;
                return (
                  <tr key={enrollment.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        href={
                          enrollment.courseSlug
                            ? ROUTES.COURSE_DETAIL(enrollment.courseSlug)
                            : ROUTES.COURSES
                        }
                        className="flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-sm border border-border overflow-hidden">
                          {enrollment.courseThumbnailUrl ? (
                            <Image
                              src={enrollment.courseThumbnailUrl}
                              alt={enrollment.courseTitle ?? ''}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-[15px] mb-0.5 group-hover:text-primary transition-colors">
                            {enrollment.courseTitle ?? 'Untitled Course'}
                          </span>
                          {enrollment.courseInstructorName && (
                            <span className="text-xs text-muted-foreground font-medium">
                              {enrollment.courseInstructorName}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {progressPercent}% {t('finish')}
                        </span>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-primary/70 rounded-full transition-all"
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
