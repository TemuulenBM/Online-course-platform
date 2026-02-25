'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EnrollmentStatus } from '@ocp/shared-types';
import { useMyEnrollments } from '@/hooks/api';
import { MyCourseCard } from '@/components/my-courses/my-course-card';
import {
  MyCoursesFilterTabs,
  type MyCoursesTab,
} from '@/components/my-courses/my-courses-filter-tabs';
import { MyCoursesEmpty } from '@/components/my-courses/my-courses-empty';
import { MyCoursesListSkeleton } from '@/components/my-courses/my-course-card-skeleton';
import { CoursesPagination } from '@/components/courses/courses-pagination';

const PAGE_LIMIT = 4;

export default function MyCoursesPage() {
  const t = useTranslations('myCourses');
  const [activeTab, setActiveTab] = useState<MyCoursesTab>('active');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  /** Tab-аас status filter руу хөрвүүлэх */
  const statusFilter: EnrollmentStatus | undefined = activeTab === 'all' ? undefined : activeTab;

  const { data, isLoading } = useMyEnrollments({
    page,
    limit: PAGE_LIMIT,
    status: statusFilter,
  });

  /** Client-side хайлт (backend search param байхгүй учраас) */
  const filteredData = useMemo(() => {
    if (!data?.data || !search.trim()) return data?.data;
    const term = search.toLowerCase();
    return data.data.filter((e) => e.courseTitle?.toLowerCase().includes(term));
  }, [data?.data, search]);

  /** Tab солих үед хуудас 1 руу буцаах + хайлт арилгах */
  const handleTabChange = (tab: MyCoursesTab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
  };

  const showingCount = filteredData?.length ?? 0;
  const totalCount = data?.total ?? 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header — title + subtitle + search */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('title')}</h1>
            {totalCount > 0 && (
              <p className="text-sm text-slate-500 mt-1">
                {t('activeLearningPaths', { count: totalCount })}
              </p>
            )}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <MyCoursesFilterTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Контент */}
        {isLoading ? (
          <MyCoursesListSkeleton />
        ) : !filteredData?.length ? (
          <MyCoursesEmpty statusFilter={activeTab} />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredData.map((enrollment) => (
              <MyCourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}

        {/* Pagination footer */}
        {!isLoading && totalCount > 0 && filteredData && filteredData.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-primary font-medium">
              {t('showingOf', {
                shown: showingCount,
                total: totalCount,
              })}
            </p>
            {totalCount > PAGE_LIMIT && (
              <CoursesPagination
                page={page}
                total={totalCount}
                limit={PAGE_LIMIT}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
