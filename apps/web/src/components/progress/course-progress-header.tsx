'use client';

import Link from 'next/link';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CourseProgress } from '@/lib/api-services/progress.service';
import { CircularProgress } from './circular-progress';
import { ROUTES } from '@/lib/constants';

interface CourseProgressHeaderProps {
  courseProgress: CourseProgress;
  courseTitle: string;
  courseSlug: string;
}

/** Сургалтын ахицын header — circular progress + CTA */
export function CourseProgressHeader({
  courseProgress,
  courseTitle,
  courseSlug,
}: CourseProgressHeaderProps) {
  const t = useTranslations('progress');

  const hours = Math.floor(courseProgress.totalTimeSpentSeconds / 3600);
  const mins = Math.floor((courseProgress.totalTimeSpentSeconds % 3600) / 60);

  /** Дараагийн дуусаагүй хичээлийг олох */
  const nextLesson = courseProgress.lessons
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .find((l) => !l.completed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Зүүн — Circular progress + stats */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 p-6 flex flex-col sm:flex-row items-center gap-6">
        <CircularProgress percentage={courseProgress.courseProgressPercentage} />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {courseTitle}
          </h2>
          <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
            <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
              <CheckCircle className="size-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {t('lessonsCompleted', {
                  completed: courseProgress.completedLessons,
                  total: courseProgress.totalLessons,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
              <Clock className="size-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {hours}
                {t('hours')} {mins}
                {t('minutes')} {t('timeSpentLabel')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Баруун — CTA card */}
      <div className="bg-primary text-white rounded-xl p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold mb-2">{t('continueLearn')}</h3>
          {nextLesson ? (
            <p className="text-sm text-white/80 mb-1">
              <span className="text-white/60">{t('nextLesson')}:</span> {nextLesson.lessonTitle}
            </p>
          ) : (
            <p className="text-sm text-white/80">{t('lessonCompletedSuccess')}</p>
          )}
        </div>
        {nextLesson && (
          <Link
            href={ROUTES.LESSON_VIEWER(courseSlug, nextLesson.lessonId)}
            className="mt-4 flex items-center justify-center gap-2 bg-white text-primary py-3 px-4 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors"
          >
            {t('startNow')}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
