'use client';

import { useTranslations } from 'next-intl';
import type { CourseProgress } from '@/lib/api-services/progress.service';

interface CourseProgressWidgetProps {
  courseProgress: CourseProgress;
}

/** Видео хичээлийн sidebar-д нийт явцын card */
export function CourseProgressWidget({ courseProgress }: CourseProgressWidgetProps) {
  const t = useTranslations('lessonViewer');
  const { completedLessons, totalLessons, courseProgressPercentage } = courseProgress;
  const remaining = totalLessons - completedLessons;

  return (
    <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/30">
      <h3 className="font-bold mb-2">{t('courseProgressTitle')}</h3>
      <div className="flex justify-between text-xs font-bold mb-2 opacity-90">
        <span>{t('lessonsCountLabel', { completed: completedLessons, total: totalLessons })}</span>
        <span>{courseProgressPercentage}%</span>
      </div>
      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500"
          style={{ width: `${courseProgressPercentage}%` }}
        />
      </div>
      {remaining > 0 && (
        <p className="text-xs mt-4 opacity-80 leading-relaxed">
          {t('progressEncouragement', { count: remaining })}
        </p>
      )}
    </div>
  );
}
