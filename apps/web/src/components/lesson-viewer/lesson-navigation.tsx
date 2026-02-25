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

/** Өмнөх / Дараах хичээл товчнууд — дизайнд тааруулсан */
export function LessonNavigation({ lessons, currentLessonId, slug }: LessonNavigationProps) {
  const t = useTranslations('lessonViewer');
  const router = useRouter();

  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIdx = sorted.findIndex((l) => l.id === currentLessonId);
  const prev = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const next = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <div className="flex items-center justify-between mt-10 pb-6">
      <button
        onClick={() => prev && router.push(ROUTES.LESSON_VIEWER(slug, prev.id))}
        disabled={!prev}
        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/20 bg-white dark:bg-slate-900 text-primary font-bold hover:bg-primary/5 transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        <ArrowLeft className="size-5" />
        {t('previousBtn')}
      </button>

      <button
        onClick={() => next && router.push(ROUTES.LESSON_VIEWER(slug, next.id))}
        disabled={!next}
        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        {t('nextBtn')}
        <ArrowRight className="size-5" />
      </button>
    </div>
  );
}
