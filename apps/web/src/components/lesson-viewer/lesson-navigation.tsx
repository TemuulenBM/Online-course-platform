'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Lesson } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';

interface LessonNavigationProps {
  lessons: Lesson[];
  currentLessonId: string;
  slug: string;
}

/** Previous / Next хичээл товчнууд */
export function LessonNavigation({ lessons, currentLessonId, slug }: LessonNavigationProps) {
  const t = useTranslations('lessonViewer');
  const router = useRouter();

  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIdx = sorted.findIndex((l) => l.id === currentLessonId);
  const prev = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const next = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={() => prev && router.push(ROUTES.LESSON_VIEWER(slug, prev.id))}
        disabled={!prev}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:border-[#8A93E5] hover:text-[#8A93E5] transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronLeft className="size-4" />
        {t('previousLesson')}
      </button>

      <button
        onClick={() => next && router.push(ROUTES.LESSON_VIEWER(slug, next.id))}
        disabled={!next}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8A93E5] text-white text-sm font-medium hover:bg-[#7B84D6] transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        {t('nextLesson')}
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
