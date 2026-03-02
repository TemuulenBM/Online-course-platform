'use client';

import { cn } from '@/lib/utils';

export type TimeFilter = 'all' | 'upcoming' | 'past';

interface SessionFilterTabsProps {
  active: TimeFilter;
  onChange: (filter: TimeFilter) => void;
}

const TABS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'Бүх хичээлүүд' },
  { value: 'upcoming', label: 'Удахгүй болох' },
  { value: 'past', label: 'Өнгөрсөн' },
];

/**
 * All / Upcoming / Past filter pill товчнууд.
 */
export function SessionFilterTabs({ active, onChange }: SessionFilterTabsProps) {
  return (
    <div className="flex items-center gap-3">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-xl px-5 py-2 text-sm font-semibold transition-all',
            active === tab.value
              ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:scale-105 active:scale-95'
              : 'bg-white text-slate-600 hover:bg-primary/10',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
