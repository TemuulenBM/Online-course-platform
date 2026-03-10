'use client';

import { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EnrollmentStatus, EnrollmentWithCourse } from '@ocp/shared-types';
import { useMyEnrollments } from '@/hooks/api';
import { MyCourseCard } from '@/components/my-courses/my-course-card';
import { EnrollmentStatusFilter } from '@/components/my-courses/enrollment-status-filter';
import { MyCoursesEmpty } from '@/components/my-courses/my-courses-empty';
import { MyCoursesListSkeleton } from '@/components/my-courses/my-course-card-skeleton';
import { CancelEnrollmentDialog } from '@/components/my-courses/cancel-enrollment-dialog';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { PageLayout } from '@/components/ui/page-layout';
import { PageHeader } from '@/components/ui/page-header';

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
    <PageLayout>
      <PageHeader
        icon={BookMarked}
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<EnrollmentStatusFilter value={statusFilter} onChange={handleFilterChange} />}
      />
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
        <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">{t('totalCourses', { count: total })}</p>
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
      {/* Cancel dialog */}
      <CancelEnrollmentDialog
        enrollment={cancelTarget}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />
    </PageLayout>
  );
}
