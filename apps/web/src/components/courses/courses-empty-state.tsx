'use client';

import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CoursesEmptyStateProps {
  onReset: () => void;
}

/** Хайлтад үр дүн олдоогүй үед харуулах */
export function CoursesEmptyState({ onReset }: CoursesEmptyStateProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <BookOpen className="size-12 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">{t('noResults')}</h3>
      <button
        onClick={onReset}
        className="mt-4 bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
      >
        {t('resetFilters')}
      </button>
    </div>
  );
}
