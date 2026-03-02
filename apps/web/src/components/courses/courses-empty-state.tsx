'use client';

import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/empty-state';

interface CoursesEmptyStateProps {
  onReset: () => void;
}

/** Хайлтад үр дүн олдоогүй үед харуулах */
export function CoursesEmptyState({ onReset }: CoursesEmptyStateProps) {
  const t = useTranslations('courses');

  return (
    <EmptyState
      icon={BookOpen}
      title={t('noResults')}
      action={{ label: t('resetFilters'), onClick: onReset }}
    />
  );
}
