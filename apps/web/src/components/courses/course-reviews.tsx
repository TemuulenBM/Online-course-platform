'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Сэтгэгдэл таб — placeholder (ирээдүйд API холбоно) */
export function CourseReviews() {
  const t = useTranslations('courses');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
        <Star className="size-7 text-amber-400" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">{t('noReviews')}</p>
    </div>
  );
}
