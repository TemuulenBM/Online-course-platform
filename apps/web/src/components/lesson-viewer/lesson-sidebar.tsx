'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Lesson } from '@ocp/shared-types';
import type { CourseProgress } from '@/lib/api-services/progress.service';
import { LessonSidebarItem } from './lesson-sidebar-item';

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  slug: string;
  courseProgress?: CourseProgress | null;
  isEnrolled: boolean;
  onEnroll?: () => void;
  enrollPending?: boolean;
}

/** Course content sidebar — хичээлүүд жагсаалт + enrollment CTA */
export function LessonSidebar({
  lessons,
  currentLessonId,
  slug,
  courseProgress,
  isEnrolled,
  onEnroll,
  enrollPending,
}: LessonSidebarProps) {
  const t = useTranslations('lessonViewer');
  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);

  /** Хичээлийн ахиц олох */
  const getProgress = (lessonId: string) =>
    courseProgress?.lessons?.find((l) => l.lessonId === lessonId);

  return (
    <div className="sticky top-24 flex flex-col gap-6">
      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('curriculum')}</h3>

      {/* Хичээлүүд жагсаалт */}
      <div className="flex flex-col gap-3">
        {sorted.map((lesson) => (
          <LessonSidebarItem
            key={lesson.id}
            lesson={lesson}
            slug={slug}
            isActive={lesson.id === currentLessonId}
            progress={getProgress(lesson.id)}
            isEnrolled={isEnrolled}
          />
        ))}
      </div>

      {/* Enrollment CTA card — зөвхөн элсээгүй үед */}
      {!isEnrolled && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white space-y-4">
          <p className="text-sm font-medium opacity-90">{t('fullAccessDesc')}</p>
          <p className="text-xl font-bold leading-tight">{t('fullAccess')}</p>
          <button
            onClick={onEnroll}
            disabled={enrollPending}
            className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {enrollPending && <Loader2 className="size-4 animate-spin" />}
            {t('startNow')}
          </button>
        </div>
      )}
    </div>
  );
}
