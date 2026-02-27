'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { EnrollmentStatus, EnrollmentWithCourse } from '@ocp/shared-types';
import { useMyEnrollments } from '@/hooks/api';
import { MyCourseCard } from '@/components/my-courses/my-course-card';
import { EnrollmentStatusFilter } from '@/components/my-courses/enrollment-status-filter';
import { MyCoursesEmpty } from '@/components/my-courses/my-courses-empty';
import { MyCoursesListSkeleton } from '@/components/my-courses/my-course-card-skeleton';
import { CancelEnrollmentDialog } from '@/components/my-courses/cancel-enrollment-dialog';
import { CoursesPagination } from '@/components/courses/courses-pagination';

const PAGE_LIMIT = 6;

export default function MyCoursesPage() {
  const t = useTranslations('myCourses');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  /** Cancel dialog state */
  const [cancelTarget, setCancelTarget] = useState<EnrollmentWithCourse | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  /** Status filter-аас API param руу хөрвүүлэх */
  const apiStatus: EnrollmentStatus | undefined = statusFilter === 'all' ? undefined : statusFilter;

  const { data, isLoading } = useMyEnrollments({
    page,
    limit: PAGE_LIMIT,
    status: apiStatus,
  });

  const enrollments = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  /** Filter солих үед хуудас 1 руу буцаах */
  const handleFilterChange = (value: EnrollmentStatus | 'all') => {
    setStatusFilter(value);
    setPage(1);
  };

  /** Cancel dialog нээх */
  const handleCancelClick = (enrollment: EnrollmentWithCourse) => {
    setCancelTarget(enrollment);
    setCancelOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-primary/5 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">{t('title')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
          </div>
          <EnrollmentStatusFilter value={statusFilter} onChange={handleFilterChange} />
        </div>
      </header>

      <div className="p-8">
        {/* Контент */}
        {isLoading ? (
          <MyCoursesListSkeleton />
        ) : !enrollments.length ? (
          <MyCoursesEmpty statusFilter={statusFilter} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {enrollments.map((enrollment) => (
              <MyCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                onCancel={handleCancelClick}
              />
            ))}
          </div>
        )}

        {/* Pagination footer */}
        {!isLoading && total > 0 && enrollments.length > 0 && (
          <div className="mt-12 flex items-center justify-between border-t border-primary/5 pt-8">
            <p className="text-sm text-slate-500">{t('totalCourses', { count: total })}</p>
            {total > PAGE_LIMIT && (
              <CoursesPagination
                page={page}
                total={total}
                limit={PAGE_LIMIT}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      <CancelEnrollmentDialog
        enrollment={cancelTarget}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </div>
  );
}
