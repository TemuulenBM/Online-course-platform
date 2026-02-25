'use client';

import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Lesson } from '@ocp/shared-types';

interface LessonHeaderProps {
  lesson: Lesson;
  contentType?: string;
  readingTimeMinutes?: number;
  moduleNumber?: number;
}

/** Хичээлийн гарчиг + metadata — text/video тусдаа badge */
export function LessonHeader({
  lesson,
  contentType,
  readingTimeMinutes,
  moduleNumber,
}: LessonHeaderProps) {
  const t = useTranslations('lessonViewer');

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <h1 className="text-3xl font-bold leading-tight">{lesson.title}</h1>
      <div className="flex items-center gap-3">
        {/* Video хичээлд Module badge */}
        {contentType === 'video' && moduleNumber && (
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
            {t('moduleLabel', { number: moduleNumber })}
          </span>
        )}
        {/* Video хугацаа */}
        {contentType === 'video' && lesson.durationMinutes > 0 && (
          <span className="text-slate-500 text-sm">{lesson.durationMinutes} минут</span>
        )}
        {/* Text хичээлд унших хугацаа */}
        {contentType === 'text' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Clock className="size-3.5" />
            {t('readingTime', { minutes: readingTimeMinutes || lesson.durationMinutes || 10 })}
          </div>
        )}
      </div>
    </div>
  );
}
