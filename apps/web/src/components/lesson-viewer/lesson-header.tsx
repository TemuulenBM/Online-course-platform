'use client';

import { Film, Clock, Eye, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Lesson, LessonType } from '@ocp/shared-types';

/** Хичээлийн төрлийн монгол label */
const lessonTypeLabels: Record<LessonType, string> = {
  video: 'VIDEO',
  text: 'TEXT',
  quiz: 'QUIZ',
  assignment: 'ASSIGNMENT',
  live: 'LIVE',
};

interface LessonHeaderProps {
  lesson: Lesson;
  isCompleted?: boolean;
  isAuthenticated?: boolean;
  onComplete?: () => void;
  completePending?: boolean;
}

/** Хичээлийн гарчиг + metadata badges */
export function LessonHeader({
  lesson,
  isCompleted,
  isAuthenticated,
  onComplete,
  completePending,
}: LessonHeaderProps) {
  const t = useTranslations('lessonViewer');

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {t('lesson')} {lesson.orderIndex}: {lesson.title}
      </h1>
      <div className="flex items-center gap-4 text-sm font-medium flex-wrap">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
          <Film className="size-4" />
          {lessonTypeLabels[lesson.lessonType]}
        </span>
        {lesson.durationMinutes > 0 && (
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock className="size-4" />
            {lesson.durationMinutes} минут
          </span>
        )}
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Eye className="size-4" />
          {t('views', { count: '–' })}
        </span>

        {/* Mark complete товч */}
        {isAuthenticated && (
          <>
            {isCompleted ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 ml-auto">
                <CheckCircle className="size-4" />
                <span className="text-sm font-medium">{t('lessonCompleted')}</span>
              </span>
            ) : (
              <button
                onClick={onComplete}
                disabled={completePending}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 ml-auto"
              >
                {completePending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle className="size-4" />
                )}
                {t('markComplete')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
