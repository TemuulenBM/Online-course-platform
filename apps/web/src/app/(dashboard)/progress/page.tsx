'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMyEnrollments } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { PageLayout } from '@/components/ui/page-layout';
import { PageHeader } from '@/components/ui/page-header';
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
    <PageLayout>
      <PageHeader
        icon={BarChart3}
        title={t('myProgress')}
        subtitle={t('myProgressDesc')}
        actions={
          <Link
            href={ROUTES.MY_COURSES}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0"
          >
            {t('continueLesson')}
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4"
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
              <p className="text-sm text-muted-foreground">
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
                  className="size-9 rounded-lg border border-border flex items-center justify-center hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        : 'border border-border hover:bg-primary/5 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="size-9 rounded-lg border border-border flex items-center justify-center hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
