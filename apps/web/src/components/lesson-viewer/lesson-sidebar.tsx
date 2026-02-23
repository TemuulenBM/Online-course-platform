'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Lesson } from '@ocp/shared-types';
import type { CourseProgress } from '@/lib/api-services/progress.service';
import { Progress } from '@/components/ui/progress';
import { LessonSidebarItem } from './lesson-sidebar-item';

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  slug: string;
  courseProgress?: CourseProgress | null;
}

/** Course content sidebar — progress bar + хичээлүүд жагсаалт */
export function LessonSidebar({
  lessons,
  currentLessonId,
  slug,
  courseProgress,
}: LessonSidebarProps) {
  const t = useTranslations('lessonViewer');
  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const progressPercent = courseProgress?.courseProgressPercentage ?? 0;

  /** Хичээлийн ахиц олох */
  const getProgress = (lessonId: string) =>
    courseProgress?.lessons?.find((l) => l.lessonId === lessonId);

  return (
    <div className="sticky top-6 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header + progress */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('courseContent')}</h3>
          <span className="text-xs font-medium text-[#8A93E5]">
            {Math.round(progressPercent)}% {t('complete')}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 [&>div]:bg-[#8A93E5]" />
      </div>

      {/* Хичээлүүд жагсаалт */}
      <div className="flex flex-col py-2 max-h-[calc(100vh-280px)] overflow-y-auto">
        {sorted.map((lesson) => (
          <LessonSidebarItem
            key={lesson.id}
            lesson={lesson}
            slug={slug}
            isActive={lesson.id === currentLessonId}
            progress={getProgress(lesson.id)}
          />
        ))}
      </div>

      {/* Download Resources */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:border-[#8A93E5] hover:text-[#8A93E5] transition-colors"
        >
          <Download className="size-4" />
          {t('downloadResources')}
        </button>
      </div>
    </div>
  );
}
