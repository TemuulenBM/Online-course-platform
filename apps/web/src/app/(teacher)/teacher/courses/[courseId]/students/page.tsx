'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight, UserPlus, Users } from 'lucide-react';
import type { EnrollmentStatus, EnrollmentWithCourse } from '@ocp/shared-types';

import { useCourseEnrollments, useCourseById } from '@/hooks/api';
import { StudentsFilterBar } from '@/components/teacher/students-filter-bar';
import { StudentsTable } from '@/components/teacher/students-table';
import { StudentsTableSkeleton } from '@/components/teacher/students-table-skeleton';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/lib/constants';

type StatusFilter = EnrollmentStatus | 'all';
type SortOption = 'newest' | 'oldest';

const PAGE_LIMIT = 20;

export default function CourseStudentsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const t = useTranslations('enrollments');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);

  /** Сургалтын мэдээлэл (гарчиг авах) */
  const { data: course } = useCourseById(courseId);

  /** Оюутнуудын жагсаалт */
  const apiStatus: EnrollmentStatus | undefined = statusFilter === 'all' ? undefined : statusFilter;
  const { data, isLoading } = useCourseEnrollments(courseId, {
    page,
    limit: PAGE_LIMIT,
    status: apiStatus,
  });

  const enrollments = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  /** Client-side sort */
  const sortedEnrollments = useMemo(() => {
    const sorted = [...enrollments];
    sorted.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [enrollments, sortBy]);

  /** Filter солих үед хуудас reset */
  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleClear = () => {
    setStatusFilter('all');
    setSortBy('newest');
    setPage(1);
  };

  /** Pagination текст */
  const from = (page - 1) * PAGE_LIMIT + 1;
  const to = Math.min(page * PAGE_LIMIT, total);

  /** Дэлгэрэнгүй үзэх (admin enrollment detail руу) */
  const handleViewDetails = (enrollment: EnrollmentWithCourse) => {
    window.open(ROUTES.ADMIN_ENROLLMENT_DETAIL(enrollment.id), '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-xl font-bold">{t('students')}</h2>
        </div>
      </header>

      <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href={ROUTES.TEACHER_COURSES} className="hover:text-primary transition-colors">
            {t('students')}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-slate-900 dark:text-white font-medium">
            {course?.title || '...'}
          </span>
        </div>

        {/* Page title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t('studentManagement')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t('studentManagementDesc', { courseTitle: course?.title || '...' })}
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  disabled
                  className="bg-primary/50 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 cursor-not-allowed"
                >
                  <UserPlus className="size-5" />
                  {t('enrollStudent')}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('comingSoon')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Шүүлтүүр */}
        <StudentsFilterBar
          statusFilter={statusFilter}
          sortBy={sortBy}
          onStatusChange={handleStatusChange}
          onSortChange={setSortBy}
          onClear={handleClear}
        />

        {/* Хүснэгт */}
        {isLoading ? (
          <StudentsTableSkeleton />
        ) : !sortedEnrollments.length ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-primary/30">
            <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Users className="size-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('noStudents')}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
              {t('noStudentsDesc')}
            </p>
          </div>
        ) : (
          <>
            <StudentsTable enrollments={sortedEnrollments} onViewDetails={handleViewDetails} />

            {/* Pagination footer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-t border-primary/10 mt-0 bg-white dark:bg-slate-900 rounded-b-xl border-x border-b border-primary/10 -mt-px">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('showingOf', { from, to, total })}
              </p>
              {total > PAGE_LIMIT && (
                <CoursesPagination
                  page={page}
                  total={total}
                  limit={PAGE_LIMIT}
                  onPageChange={setPage}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
