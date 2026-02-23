'use client';

import type { Lesson } from '@ocp/shared-types';

interface LessonHeaderProps {
  lesson: Lesson;
}

/** Хичээлийн гарчиг — дугаар + нэр */
export function LessonHeader({ lesson }: LessonHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        {String(lesson.orderIndex).padStart(2, '0')}. {lesson.title}
      </h1>
    </div>
  );
}
