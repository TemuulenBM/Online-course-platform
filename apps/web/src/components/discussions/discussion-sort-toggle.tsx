'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface DiscussionSortToggleProps {
  value: string;
  onChange: (value: string) => void;
}

/** Эрэмбэлэх toggle: Шинэ | Санал | Үзсэн */
export function DiscussionSortToggle({ value, onChange }: DiscussionSortToggleProps) {
  const t = useTranslations('discussions');

  const options = [
    { label: t('sortNewest'), value: 'newest' },
    { label: t('sortVotes'), value: 'votes' },
    { label: t('sortViews'), value: 'views' },
  ];

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-slate-200 dark:border-slate-700 p-0.5"
      role="tablist"
      aria-label="Эрэмбэлэх"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all',
            value === opt.value
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-primary',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
