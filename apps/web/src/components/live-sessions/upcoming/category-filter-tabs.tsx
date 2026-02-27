'use client';

import { cn } from '@/lib/utils';

interface CategoryFilterTabsProps {
  /** Ангиллуудын жагсаалт */
  categories: { id: string; name: string }[];
  /** Идэвхтэй ангиллын ID (null = Бүгд) */
  activeId: string | null;
  /** Сонголт солигдоход */
  onChange: (id: string | null) => void;
}

/**
 * Ангиллын filter tabs — дизайны адилаар pill хэлбэртэй товчнууд.
 */
export function CategoryFilterTabs({ categories, activeId, onChange }: CategoryFilterTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors',
          activeId === null
            ? 'bg-primary text-white'
            : 'border border-primary/10 bg-white text-slate-600 hover:border-primary',
        )}
      >
        Бүгд
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors',
            activeId === cat.id
              ? 'bg-primary text-white'
              : 'border border-primary/10 bg-white text-slate-600 hover:border-primary',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
