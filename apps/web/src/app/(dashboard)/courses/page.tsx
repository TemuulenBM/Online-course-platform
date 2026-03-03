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
  const { filters, setFilter, setSort, resetFilters } = useCourseFilters();
  const { data, isLoading } = useCourseList(filters);
  const { data: categories } = useCategoryTree();

  /** Идэвхтэй шүүлтүүр байгаа эсэхийг шалгах */
  const hasActiveFilters = !!(
    filters.search ||
    filters.categoryId ||
    filters.difficulty ||
    (filters.sortBy && filters.sortBy !== 'publishedAt')
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header + Search + Category + Sort */}
        <CoursesHeader
          search={filters.search}
          categoryId={filters.categoryId}
          categories={categories}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSearchChange={(value) => setFilter('search', value)}
          onCategoryChange={(value) => setFilter('categoryId', value)}
          onSortChange={setSort}
        />

        {/* Түвшин шүүлтүүр */}
        <CoursesFilterBar
          difficulty={filters.difficulty}
          hasActiveFilters={hasActiveFilters}
          onFilterChange={setFilter}
          onClearAll={resetFilters}
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
        <div className="p-6 lg:p-10">
          <CourseGridSkeleton />
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
