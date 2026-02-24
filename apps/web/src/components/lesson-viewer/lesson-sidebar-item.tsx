'use client';

import { CheckCircle, PlayCircle, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Lesson } from '@ocp/shared-types';
import type { LessonProgressSummary } from '@/lib/api-services/progress.service';
import { ROUTES } from '@/lib/constants';

interface LessonSidebarItemProps {
  lesson: Lesson;
  slug: string;
  isActive: boolean;
  progress?: LessonProgressSummary;
}

/** Sidebar дахь нэг хичээлийн мөр */
export function LessonSidebarItem({ lesson, slug, isActive, progress }: LessonSidebarItemProps) {
  const router = useRouter();
  const isCompleted = progress?.completed;

  /** Lesson төрлийн label */
  const typeLabel = lesson.lessonType.charAt(0).toUpperCase() + lesson.lessonType.slice(1);
  const durationLabel = lesson.durationMinutes
    ? `${String(Math.floor(lesson.durationMinutes / 60)).padStart(2, '0')}:${String(lesson.durationMinutes % 60).padStart(2, '0')}`
    : '';

  return (
    <button
      onClick={() => router.push(ROUTES.LESSON_VIEWER(slug, lesson.id))}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg ${
        isActive
          ? 'bg-[#8A93E5]/10 border-l-2 border-[#8A93E5]'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      {/* Icon */}
      {isCompleted ? (
        <CheckCircle className="size-5 text-emerald-500 shrink-0" />
      ) : isActive ? (
        <PlayCircle className="size-5 text-[#8A93E5] shrink-0" />
      ) : (
        <Circle className="size-5 text-slate-300 dark:text-slate-600 shrink-0" />
      )}

      {/* Мэдээлэл */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm truncate ${
            isActive
              ? 'font-semibold text-[#8A93E5]'
              : isCompleted
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {lesson.title}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {typeLabel}
          {durationLabel && ` · ${durationLabel}`}
        </p>
      </div>
    </button>
  );
}
