'use client';

import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/empty-state';
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
    <EmptyState
      icon={BookOpen}
      title={messageMap[statusFilter]}
      description={t('emptySubtitle')}
      action={
        statusFilter === 'all' ? { label: t('browseCourses'), href: ROUTES.COURSES } : undefined
      }
    />
  );
}
