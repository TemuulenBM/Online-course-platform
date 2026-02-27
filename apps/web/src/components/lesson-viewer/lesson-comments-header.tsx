'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface LessonCommentsHeaderProps {
  total: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

/** Сэтгэгдлийн header — тоо + subtitle + sort toggle */
export function LessonCommentsHeader({ total, sortBy, onSortChange }: LessonCommentsHeaderProps) {
  const t = useTranslations('discussions');

  const sortOptions = [
    { label: t('commentSortNewest'), value: 'newest' },
    { label: t('commentSortUpvotes'), value: 'upvotes' },
    { label: t('commentSortTimestamp'), value: 'timestamp' },
  ];

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          <span className="text-2xl">{total}</span> {t('commentsCount')}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{t('commentsSubtitle')}</p>
      </div>
      <div className="flex items-center gap-0.5 rounded-full border border-slate-200 dark:border-slate-700 p-0.5">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSortChange(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
              sortBy === opt.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-primary',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
