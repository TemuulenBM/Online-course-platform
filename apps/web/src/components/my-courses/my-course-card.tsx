'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Download, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EnrollmentWithCourse } from '@ocp/shared-types';
import { useCourseProgress } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MyCourseCardProps {
  enrollment: EnrollmentWithCourse;
  onCancel?: (enrollment: EnrollmentWithCourse) => void;
}

/** Статус badge өнгөний mapping */
const statusBadgeStyles: Record<string, string> = {
  active: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  completed: 'bg-primary/10 text-primary',
  expired: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
  cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-500',
};

/** Нэг элсэлтийн карт — дизайн дагуу */
export function MyCourseCard({ enrollment, onCancel }: MyCourseCardProps) {
  const t = useTranslations('myCourses');

  const isActiveOrCompleted = enrollment.status === 'active' || enrollment.status === 'completed';
  const isInactive = enrollment.status === 'expired' || enrollment.status === 'cancelled';

  const {
    data: progress,
    isLoading: progressLoading,
    isError: progressError,
  } = useCourseProgress(isActiveOrCompleted ? enrollment.courseId : '');

  const progressPercentage = progress?.courseProgressPercentage ?? 0;
  const courseSlug = enrollment.courseSlug || enrollment.courseId;
  const courseDetailUrl = ROUTES.COURSE_DETAIL(courseSlug);

  /** Огноо формат */
  const dateText =
    enrollment.status === 'completed' && enrollment.completedAt
      ? t('completedOn', { date: new Date(enrollment.completedAt).toLocaleDateString('mn-MN') })
      : new Date(enrollment.enrolledAt).toLocaleDateString('mn-MN');

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-2xl border border-primary/5 shadow-sm overflow-hidden flex flex-col sm:flex-row group',
        isInactive && 'opacity-75',
      )}
    >
      {/* Thumbnail */}
      <Link href={courseDetailUrl} className="sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0">
        <div
          className={cn(
            'w-full h-full relative transition-transform duration-500 group-hover:scale-110',
            isInactive && 'grayscale',
          )}
        >
          {enrollment.courseThumbnailUrl ? (
            <Image
              src={enrollment.courseThumbnailUrl}
              alt={enrollment.courseTitle || ''}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <BookOpen className="size-10 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>
      </Link>

      {/* Контент */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          {/* Status badge + огноо */}
          <div className="flex justify-between items-start mb-2">
            <span
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider',
                statusBadgeStyles[enrollment.status],
              )}
            >
              {enrollment.status.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 font-medium italic">{dateText}</span>
          </div>

          {/* Гарчиг */}
          <Link href={courseDetailUrl}>
            <h3 className="text-lg font-bold line-clamp-1 hover:text-primary transition-colors">
              {enrollment.courseTitle}
            </h3>
          </Link>

          {/* Багш */}
          {enrollment.courseInstructorName && (
            <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
              <User className="size-3.5" />
              <p className="text-sm font-medium">Багш: {enrollment.courseInstructorName}</p>
            </div>
          )}

          {/* Progress bar (active/completed зөвхөн) */}
          {isActiveOrCompleted && (
            <div className="mt-3">
              {progressLoading && !progressError ? (
                <Skeleton className="h-1.5 w-full rounded-full" />
              ) : (
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary',
                    )}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Үйлдлийн товчнууд */}
        <div className="mt-6 flex gap-3">
          {enrollment.status === 'active' && (
            <>
              <Link href={courseDetailUrl} className="flex-1">
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-primary/20">
                  {t('continue')}
                </button>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onCancel?.(enrollment);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                {t('cancelEnrollment')}
              </button>
            </>
          )}

          {enrollment.status === 'completed' && (
            <>
              <Link href={courseDetailUrl} className="flex-1">
                <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold py-2.5 px-4 rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  {t('review')}
                </button>
              </Link>
              <button className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 transition-colors text-sm font-medium flex items-center justify-center">
                <Download className="size-5" />
              </button>
            </>
          )}

          {enrollment.status === 'expired' && (
            <button
              disabled
              className="flex-1 bg-white dark:bg-slate-900 border border-primary text-primary font-semibold py-2.5 px-4 rounded-xl text-sm cursor-not-allowed opacity-60"
            >
              {t('extend')}
            </button>
          )}

          {enrollment.status === 'cancelled' && (
            <button
              disabled
              className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-400 font-semibold py-2.5 px-4 rounded-xl text-sm cursor-not-allowed"
            >
              {t('cannotReEnroll')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
