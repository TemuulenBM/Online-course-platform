'use client';

import { useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface CoursesHeaderProps {
  search?: string;
  totalCount?: number;
  onSearchChange: (value: string | undefined) => void;
}

/** Courses хуудасны header — гарчиг + хайлт */
export function CoursesHeader({ search, totalCount, onSearchChange }: CoursesHeaderProps) {
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('title')}</h2>
          {totalCount != null && (
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t('totalCourses', { count: totalCount })}
            </p>
          )}
        </div>
      </div>

      <div className="relative group">
        <Search className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" />
        <input
          type="text"
          defaultValue={search}
          onChange={handleSearch}
          placeholder={t('search')}
          className="w-full sm:w-[300px] bg-slate-100 dark:bg-slate-800 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all outline-none text-slate-700 dark:text-slate-200"
        />
      </div>
    </div>
  );
}
