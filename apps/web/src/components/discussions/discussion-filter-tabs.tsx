'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface DiscussionFilterTabsProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

/** Шүүлтүүрийн tab-ууд: Бүгд | Асуулт | Хэлэлцүүлэг */
export function DiscussionFilterTabs({ value, onChange }: DiscussionFilterTabsProps) {
  const t = useTranslations('discussions');

  const tabs = [
    { label: t('filterAll'), value: undefined },
    { label: t('filterQuestion'), value: 'question' },
    { label: t('filterDiscussion'), value: 'discussion' },
  ];

  return (
    <div className="flex items-center gap-1.5" role="tablist" aria-label="Нийтлэлийн төрлөөр шүүх">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-semibold transition-all',
            value === tab.value
              ? 'bg-primary text-white shadow-sm shadow-primary/25'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
