'use client';

import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/empty-state';
import { ROUTES } from '@/lib/constants';

/** Хичээл олдоогүй үеийн empty state */
export function ProgressEmpty() {
  const t = useTranslations('progress');

  return (
    <EmptyState
      icon={BookOpen}
      title={t('noCoursesFound')}
      description={t('noCoursesDesc')}
      action={{ label: t('browseCourses'), href: ROUTES.COURSES }}
    />
  );
}
