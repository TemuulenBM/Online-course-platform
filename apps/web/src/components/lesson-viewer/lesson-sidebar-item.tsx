'use client';

import { CheckCircle2, Circle, Lock, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Lesson } from '@ocp/shared-types';
import type { LessonProgressSummary } from '@/lib/api-services/progress.service';
import { ROUTES } from '@/lib/constants';

interface LessonSidebarItemProps {
  lesson: Lesson;
  slug: string;
  isActive: boolean;
  progress?: LessonProgressSummary;
  isEnrolled: boolean;
}

/** Sidebar дахь section outline item — check/circle/lock/quiz icons */
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
  const isQuiz = lesson.lessonType === 'quiz';

  const handleClick = () => {
    if (isAccessible) {
      router.push(ROUTES.LESSON_VIEWER(slug, lesson.id));
    }
  };

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
