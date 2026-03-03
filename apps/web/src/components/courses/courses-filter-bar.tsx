'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface CoursesFilterBarProps {
  difficulty?: string;
  hasActiveFilters?: boolean;
  onFilterChange: (key: string, value: string | undefined) => void;
  onClearAll?: () => void;
}

/** Түвшин шүүлтүүр — pill buttons + clear all */
export function CoursesFilterBar({
  difficulty,
  hasActiveFilters,
  onFilterChange,
  onClearAll,
}: CoursesFilterBarProps) {
  const t = useTranslations('courses');

  const levels = [
    { value: undefined, label: t('allLevels') },
    { value: 'beginner', label: t('beginner') },
    { value: 'intermediate', label: t('intermediate') },
    { value: 'advanced', label: t('advanced') },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-10">
      {levels.map((level) => {
        const isActive = difficulty === level.value || (!difficulty && !level.value);
        return (
          <button
            key={level.value ?? 'all'}
            type="button"
            onClick={() => onFilterChange('difficulty', level.value)}
            className={cn(
              'px-6 py-2.5 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all',
              isActive
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-800 border border-border hover:border-primary text-slate-600 dark:text-slate-400',
            )}
          >
            {level.label}
          </button>
        );
      })}

      {hasActiveFilters && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all whitespace-nowrap"
        >
          {t('resetFilters')}
        </button>
      )}
    </div>
  );
}
