'use client';

import { useRef, useCallback } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { Category } from '@ocp/shared-types';

interface CoursesHeaderProps {
  search?: string;
  categoryId?: string;
  categories?: Category[];
  onSearchChange: (value: string | undefined) => void;
  onCategoryChange: (value: string | undefined) => void;
}

/** Courses хуудасны header — гарчиг + хайлт + ангилал dropdown */
export function CoursesHeader({
  search,
  categoryId,
  categories,
  onSearchChange,
  onCategoryChange,
}: CoursesHeaderProps) {
  const t = useTranslations('courses');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(value || undefined);
      }, 300);
    },
    [onSearchChange],
  );

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          {t('catalogTitle')}
        </h1>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">{t('catalogSubtitle')}</p>

      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:flex-1">
          <Search className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            defaultValue={search}
            onChange={handleSearch}
            placeholder={t('search')}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
        <div className="relative w-full lg:w-48">
          <select
            value={categoryId || 'all'}
            onChange={(e) =>
              onCategoryChange(e.target.value === 'all' ? undefined : e.target.value)
            }
            className="w-full appearance-none pl-4 pr-10 py-3.5 bg-white dark:bg-slate-800 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="all">{t('allCategories')}</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            {categories?.flatMap((cat) =>
              (cat.children ?? []).map((child) => (
                <option key={child.id} value={child.id}>
                  &nbsp;&nbsp;{child.name}
                </option>
              )),
            )}
          </select>
          <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
