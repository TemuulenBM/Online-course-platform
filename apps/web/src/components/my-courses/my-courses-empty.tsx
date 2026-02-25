'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants';

interface MyCoursesEmptyProps {
  statusFilter: 'all' | 'active' | 'completed';
}

/** Хоосон төлөв — элсэлт байхгүй үед харуулна */
export function MyCoursesEmpty({ statusFilter }: MyCoursesEmptyProps) {
  const t = useTranslations('myCourses');

  const message =
    statusFilter === 'active'
      ? t('noActiveCourses')
      : statusFilter === 'completed'
        ? t('noCompletedCourses')
        : t('empty');

  return (
    <div className="text-center py-20 flex flex-col items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/70/10 flex items-center justify-center">
        <BookOpen className="size-10 text-slate-300" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{message}</h3>
        <p className="text-sm text-slate-500">{t('emptySubtitle')}</p>
      </div>
      {statusFilter === 'all' && (
        <Link
          href={ROUTES.COURSES}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/70 text-white font-semibold shadow-lg shadow-primary/25 hover:scale-105 transition-transform"
        >
          {t('browseCourses')}
        </Link>
      )}
    </div>
  );
}
