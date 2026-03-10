'use client';

import { cn } from '@/lib/utils';

interface FilterTabsProps<T extends string | undefined> {
  /** Шүүлтүүрийн tab-ууд */
  tabs: readonly { value: T; label: string }[];
  /** Идэвхтэй утга */
  activeValue: T;
  /** Утга өөрчлөгдөх үед */
  onChange: (value: T) => void;
  className?: string;
}

/** Нэгдсэн pill-style filter tabs — бүх хуудсанд ижил стилтэй */
export function FilterTabs<T extends string | undefined>({
  tabs,
  activeValue,
  onChange,
  className,
}: FilterTabsProps<T>) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          role="tab"
          aria-selected={activeValue === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-semibold transition-all',
            activeValue === tab.value
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
