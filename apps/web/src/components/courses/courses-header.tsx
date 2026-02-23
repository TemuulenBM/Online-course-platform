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

/** Courses хуудасны header — гарчиг (тоотой) + хайлт */
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
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
          {t('allCourses')}
          {totalCount != null && (
            <span className="text-slate-400 dark:text-slate-500 font-medium text-lg lg:text-xl ml-2">
              ({totalCount})
            </span>
          )}
        </h2>
      </div>

      <div className="relative group">
        <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8A93E5]" />
        <input
          type="text"
          defaultValue={search}
          onChange={handleSearch}
          placeholder={t('search')}
          className="w-full sm:w-[280px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#8A93E5]/30 focus:border-[#8A93E5] transition-all outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
