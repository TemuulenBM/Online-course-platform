'use client';

import { useTranslations } from 'next-intl';

interface LessonProgressBarProps {
  progressPercentage: number;
}

/** Хичээлийн ахицын bar — text хичээлд ашиглагдана */
export function LessonProgressBar({ progressPercentage }: LessonProgressBarProps) {
  const t = useTranslations('lessonViewer');
  const clamped = Math.min(100, Math.max(0, Math.round(progressPercentage)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>{t('lessonProgressLabel')}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
