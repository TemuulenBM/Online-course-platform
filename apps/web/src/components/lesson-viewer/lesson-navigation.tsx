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

/** Өмнөх / Дараах хичээл товчнууд + dot indicator */
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
        className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors font-medium disabled:opacity-40 disabled:pointer-events-none"
      >
        <ArrowLeft className="size-5" />
        {t('previousBtn')}
      </button>

      {/* Dot indicator — хичээлийн байршлыг харуулна */}
      <div className="hidden sm:flex items-center gap-1.5">
        {sorted.map((lesson, idx) => (
          <button
            key={lesson.id}
            onClick={() => router.push(ROUTES.LESSON_VIEWER(slug, lesson.id))}
            className={`size-2 rounded-full transition-all ${
              idx === currentIdx ? 'bg-primary scale-125' : 'bg-primary/20 hover:bg-primary/40'
            }`}
            aria-label={`${t('lesson')} ${idx + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => next && router.push(ROUTES.LESSON_VIEWER(slug, next.id))}
        disabled={!next}
        className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-all font-medium disabled:opacity-40 disabled:pointer-events-none"
      >
        {t('nextBtn')}
        <ArrowRight className="size-5" />
      </button>
    </div>
  );
}
