'use client';

import { CheckCircle, PlayCircle, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Lesson } from '@ocp/shared-types';
import type { LessonProgressSummary } from '@/lib/api-services/progress.service';
import { ROUTES } from '@/lib/constants';

/** Хичээлийн төрлийн label */
const typeLabels: Record<string, string> = {
  video: 'Видео',
  text: 'Текст',
  quiz: 'Тест',
  assignment: 'Даалгавар',
  live: 'Шууд',
};

interface LessonSidebarItemProps {
  lesson: Lesson;
  slug: string;
  isActive: boolean;
  progress?: LessonProgressSummary;
  isEnrolled: boolean;
}

/** Sidebar дахь нэг хичээлийн мөр — дизайнд тааруулсан */
export function LessonSidebarItem({
  lesson,
  slug,
  isActive,
  progress,
  isEnrolled,
}: LessonSidebarItemProps) {
  const router = useRouter();
  const isCompleted = progress?.completed;
  const isAccessible = lesson.isPreview || isEnrolled;

  const durationLabel = lesson.durationMinutes ? `${lesson.durationMinutes} мин` : '';

  const handleClick = () => {
    if (isAccessible) {
      router.push(ROUTES.LESSON_VIEWER(slug, lesson.id));
    }
  };

  /** Active хичээл */
  if (isActive) {
    return (
      <button
        onClick={handleClick}
        className="w-full p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4 text-left"
      >
        <PlayCircle className="size-5 text-primary shrink-0" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold text-primary truncate">
            {lesson.orderIndex}. {lesson.title}
          </p>
          <p className="text-xs text-primary/70">
            {durationLabel && `${durationLabel} • `}
            {typeLabels[lesson.lessonType]}
          </p>
        </div>
        {isCompleted && <CheckCircle className="size-4 text-primary shrink-0" />}
      </button>
    );
  }

  /** Locked хичээл */
  if (!isAccessible) {
    return (
      <div className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-4 opacity-50">
        <Lock className="size-5 text-slate-400 shrink-0" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold truncate">
            {lesson.orderIndex}. {lesson.title}
          </p>
          <p className="text-xs text-slate-500">
            {durationLabel && `${durationLabel} • `}
            {typeLabels[lesson.lessonType]}
          </p>
        </div>
      </div>
    );
  }

  /** Хэвийн хичээл */
  return (
    <button
      onClick={handleClick}
      className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
    >
      {isCompleted ? (
        <CheckCircle className="size-5 text-emerald-500 shrink-0" />
      ) : (
        <PlayCircle className="size-5 text-slate-400 shrink-0" />
      )}
      <div className="flex-1 overflow-hidden">
        <p className={`text-sm font-bold truncate ${isCompleted ? 'text-slate-500' : ''}`}>
          {lesson.orderIndex}. {lesson.title}
        </p>
        <p className="text-xs text-slate-500">
          {durationLabel && `${durationLabel} • `}
          {typeLabels[lesson.lessonType]}
        </p>
      </div>
    </button>
  );
}
