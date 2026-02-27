'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants';

type StatusFilter = 'all' | 'active' | 'completed' | 'cancelled' | 'expired';

interface MyCoursesEmptyProps {
  statusFilter: StatusFilter;
}

/** Хоосон төлөв — элсэлт байхгүй үед харуулна */
export function MyCoursesEmpty({ statusFilter }: MyCoursesEmptyProps) {
  const t = useTranslations('myCourses');

  const messageMap: Record<StatusFilter, string> = {
    all: t('empty'),
    active: t('noActiveCourses'),
    completed: t('noCompletedCourses'),
    cancelled: t('noCancelledCourses'),
    expired: t('noExpiredCourses'),
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="size-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <BookOpen className="size-12 text-primary/30" />
      </div>
      <h3 className="text-xl font-bold mb-2">{messageMap[statusFilter]}</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">{t('emptySubtitle')}</p>
      {statusFilter === 'all' && (
        <Link
          href={ROUTES.COURSES}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all"
        >
          <span>{t('browseCourses')}</span>
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
