'use client';

import { CheckCircle2, Circle, Lock, PlayCircle, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Lesson } from '@ocp/shared-types';
import type { LessonProgressSummary } from '@/lib/api-services/progress.service';
import { ROUTES } from '@/lib/constants';

interface LessonSidebarItemProps {
  lesson: Lesson;
  slug: string;
  isActive: boolean;
  progress?: LessonProgressSummary;
  isEnrolled: boolean;
  /** video variant — border-l-4 + "Одоо үзэж байна" label */
  variant?: 'text' | 'video';
}

/** Sidebar дахь хичээлийн item — text/video тусдаа дизайн */
export function LessonSidebarItem({
  lesson,
  slug,
  isActive,
  progress,
  isEnrolled,
  variant = 'text',
}: LessonSidebarItemProps) {
  const router = useRouter();
  const t = useTranslations('progress');
  const isCompleted = progress?.completed;
  const isAccessible = lesson.isPreview || isEnrolled;
  const isQuiz = lesson.lessonType === 'quiz';

  const handleClick = () => {
    if (isAccessible) {
      router.push(ROUTES.LESSON_VIEWER(slug, lesson.id));
    }
  };

  /** Хугацааг форматлах */
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:00`;
    return `${m}:00`;
  };

  /** ───── VIDEO VARIANT ───── */
  if (variant === 'video') {
    /** Active — border-l-4 + primary text + "Одоо үзэж байна" */
    if (isActive) {
      return (
        <button
          onClick={handleClick}
          className="w-full flex items-center gap-3 p-3 rounded-xl border-l-4 border-primary bg-primary/5 text-left transition-colors"
        >
          <PlayCircle className="size-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {lesson.orderIndex}. {lesson.title}
            </p>
            <span className="text-[11px] text-primary font-medium">{t('nowWatching')}</span>
          </div>
        </button>
      );
    }

    /** Completed — check icon */
    if (isCompleted) {
      return (
        <button
          onClick={handleClick}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
        >
          <CheckCircle2 className="size-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
              {lesson.orderIndex}. {lesson.title}
            </p>
            {lesson.durationMinutes > 0 && (
              <span className="text-[11px] text-slate-400">
                {formatDuration(lesson.durationMinutes)}
              </span>
            )}
          </div>
        </button>
      );
    }

    /** Locked — lock icon + opacity-60 */
    if (!isAccessible) {
      return (
        <div className="flex items-center gap-3 p-3 rounded-xl opacity-60">
          <Lock className="size-5 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">
              {lesson.orderIndex}. {lesson.title}
            </p>
            {lesson.durationMinutes > 0 && (
              <span className="text-[11px] text-slate-400">
                {formatDuration(lesson.durationMinutes)}
              </span>
            )}
          </div>
        </div>
      );
    }

    /** Normal (accessible, not completed, not active) */
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
      >
        <Circle className="size-5 text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
            {lesson.orderIndex}. {lesson.title}
          </p>
          {lesson.durationMinutes > 0 && (
            <span className="text-[11px] text-slate-400">
              {formatDuration(lesson.durationMinutes)}
            </span>
          )}
        </div>
      </button>
    );
  }

  /** ───── TEXT VARIANT (одоогийн дизайн) ───── */

  /** Icon сонголт */
  const getIcon = () => {
    if (isQuiz) return <HelpCircle className="size-4 shrink-0" />;
    if (!isAccessible) return <Lock className="size-4 shrink-0" />;
    if (isCompleted) return <CheckCircle2 className="size-4 shrink-0" />;
    return <Circle className="size-4 shrink-0" />;
  };

  /** Active item */
  if (isActive) {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 p-2 rounded-lg bg-primary/10 text-primary text-left"
      >
        {getIcon()}
        <span className="text-sm font-medium">
          {lesson.orderIndex}. {lesson.title}
        </span>
      </button>
    );
  }

  /** Locked item */
  if (!isAccessible) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg text-slate-400">
        {getIcon()}
        <span className="text-sm">
          {lesson.orderIndex}. {lesson.title}
        </span>
      </div>
    );
  }

  /** Normal item */
  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
    >
      {getIcon()}
      <span className="text-sm">
        {lesson.orderIndex}. {lesson.title}
      </span>
    </button>
  );
}
