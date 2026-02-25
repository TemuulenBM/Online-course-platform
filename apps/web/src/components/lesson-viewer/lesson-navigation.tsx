'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Lesson } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';

interface LessonNavigationProps {
  lessons: Lesson[];
  currentLessonId: string;
  slug: string;
}

/** Previous / Next хичээл товчнууд — дизайнд тааруулсан */
export function LessonNavigation({ lessons, currentLessonId, slug }: LessonNavigationProps) {
  const t = useTranslations('lessonViewer');
  const router = useRouter();

  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIdx = sorted.findIndex((l) => l.id === currentLessonId);
  const prev = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const next = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => prev && router.push(ROUTES.LESSON_VIEWER(slug, prev.id))}
        disabled={!prev}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        <ArrowLeft className="size-4" />
        {t('previousLesson')}
      </button>

      <button
        onClick={() => next && router.push(ROUTES.LESSON_VIEWER(slug, next.id))}
        disabled={!next}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        {t('nextLesson')}
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
