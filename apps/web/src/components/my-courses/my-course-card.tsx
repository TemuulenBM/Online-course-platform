'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCourseProgress } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import type { EnrollmentWithCourse } from '@/lib/api-services/enrollments.service';

interface MyCourseCardProps {
  enrollment: EnrollmentWithCourse;
}

/** Нэг элсэлтийн хэвтээ карт — Stitch дизайн */
export function MyCourseCard({ enrollment }: MyCourseCardProps) {
  const t = useTranslations('myCourses');

  const isActiveOrCompleted = enrollment.status === 'active' || enrollment.status === 'completed';

  const {
    data: progress,
    isLoading: progressLoading,
    isError: progressError,
  } = useCourseProgress(enrollment.courseId);

  const progressPercentage = progress?.courseProgressPercentage ?? 0;
  const courseSlug = enrollment.courseSlug || enrollment.courseId;
  const courseDetailUrl = ROUTES.COURSE_DETAIL(courseSlug);

  return (
    <Link href={courseDetailUrl}>
      <div className="flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 group">
        {/* Thumbnail */}
        <div className="w-[140px] h-[100px] rounded-xl overflow-hidden shrink-0 relative">
          {enrollment.courseThumbnailUrl ? (
            <Image
              src={enrollment.courseThumbnailUrl}
              alt={enrollment.courseTitle || ''}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/70/15 to-emerald-200/20 dark:from-primary/10 dark:via-primary/70/10 dark:to-emerald-900/10 flex items-center justify-center">
              <BookOpen className="size-8 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>

        {/* Content — дунд хэсэг */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
            {enrollment.courseTitle}
          </h3>

          {/* Instructor */}
          {enrollment.courseInstructorName && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {enrollment.courseInstructorName}
            </p>
          )}

          {/* Progress bar + percentage */}
          {isActiveOrCompleted && (
            <div className="mt-3">
              {progressLoading && !progressError ? (
                <Skeleton className="h-1.5 w-full rounded-full" />
              ) : (
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              )}
              <span className="block text-sm text-slate-500 dark:text-slate-400 mt-1.5 text-right">
                {progressLoading && !progressError ? (
                  <Skeleton className="h-4 w-10 inline-block rounded" />
                ) : (
                  `${progressPercentage}%`
                )}
              </span>
            </div>
          )}
        </div>

        {/* Action button — баруун тал */}
        <div className="shrink-0">
          {enrollment.status === 'active' ? (
            <span className="inline-flex items-center px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-[#7B84D9] transition-colors shadow-sm">
              {t('continue')}
            </span>
          ) : enrollment.status === 'completed' ? (
            <span className="inline-flex items-center px-6 py-2.5 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              {t('review')}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
