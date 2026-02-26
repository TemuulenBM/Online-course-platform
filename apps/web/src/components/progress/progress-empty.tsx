'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants';

/** Хичээл олдоогүй үеийн empty state */
export function ProgressEmpty() {
  const t = useTranslations('progress');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <BookOpen className="size-9 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
        {t('noCoursesFound')}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        {t('noCoursesDesc')}
      </p>
      <Link
        href={ROUTES.COURSES}
        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        {t('browseCourses')}
      </Link>
    </div>
  );
}
