'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMyEnrollments } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { ProgressStatsCards } from '@/components/progress/progress-stats-cards';
import { ProgressCoursesTable } from '@/components/progress/progress-courses-table';
import { ProgressTableSkeleton } from '@/components/progress/progress-table-skeleton';
import { ProgressEmpty } from '@/components/progress/progress-empty';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_LIMIT = 10;

export default function MyProgressPage() {
  const t = useTranslations('progress');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyEnrollments({ page, limit: PAGE_LIMIT });
  const enrollments = data?.data ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  /** Enrollment data-аас stats тооцоолох */
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-xl font-bold">{t('myProgress')}</h2>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('myProgress')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('myProgressDesc')}</p>
          </div>
          <Link
            href={ROUTES.MY_COURSES}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0"
          >
            {t('continueLesson')}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 p-5 flex items-center gap-4"
              >
                <Skeleton className="size-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProgressStatsCards
            totalCourses={total}
            completedCourses={completedCount}
            totalTimeSpentSeconds={0}
            avgProgressPercentage={total > 0 ? Math.round((completedCount / total) * 100) : 0}
          />
        )}

        {/* Courses Table */}
        {isLoading ? (
          <ProgressTableSkeleton />
        ) : enrollments.length === 0 ? (
          <ProgressEmpty />
        ) : (
          <>
            <ProgressCoursesTable enrollments={enrollments} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {t('showingRange', {
                    from: (page - 1) * PAGE_LIMIT + 1,
                    to: Math.min(page * PAGE_LIMIT, total),
                    total,
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="size-9 rounded-lg border border-primary/10 flex items-center justify-center hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`size-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-white'
                          : 'border border-primary/10 hover:bg-primary/5 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="size-9 rounded-lg border border-primary/10 flex items-center justify-center hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
