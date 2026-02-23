'use client';

import { Suspense } from 'react';
import { useCourseList, useCategoryTree } from '@/hooks/api';
import { useCourseFilters } from '@/hooks/use-course-filters';
import { CoursesHeader } from '@/components/courses/courses-header';
import { CoursesFilterBar } from '@/components/courses/courses-filter-bar';
import { CourseGrid } from '@/components/courses/course-grid';
import { CourseGridSkeleton } from '@/components/courses/course-card-skeleton';
import { CoursesEmptyState } from '@/components/courses/courses-empty-state';
import { CoursesPagination } from '@/components/courses/courses-pagination';

/** Courses listing page — useSearchParams ашигладаг тул Suspense-д ороох хэрэгтэй */
function CoursesContent() {
  const { filters, setFilter, resetFilters } = useCourseFilters();
  const { data, isLoading } = useCourseList(filters);
  const { data: categories } = useCategoryTree();

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <CoursesHeader
          search={filters.search}
          totalCount={data?.total}
          onSearchChange={(value) => setFilter('search', value)}
        />

        {/* Шүүлтүүр */}
        <CoursesFilterBar
          categoryId={filters.categoryId}
          difficulty={filters.difficulty}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          categories={categories}
          onFilterChange={setFilter}
        />

        {/* Контент */}
        {isLoading ? (
          <CourseGridSkeleton />
        ) : !data?.data?.length ? (
          <CoursesEmptyState onReset={resetFilters} />
        ) : (
          <>
            <CourseGrid courses={data.data} />
            <CoursesPagination
              page={filters.page ?? 1}
              total={data.total ?? 0}
              limit={filters.limit ?? 12}
              onPageChange={(page) => setFilter('page', String(page))}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 lg:p-8">
          <CourseGridSkeleton />
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
