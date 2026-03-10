'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BookOpen, PlusCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Course } from '@ocp/shared-types';

import { useMyCourses, usePublishCourse, useArchiveCourse } from '@/hooks/api';
import { TeacherCoursesTable } from '@/components/teacher/teacher-courses-table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { PageHeader } from '@/components/ui/page-header';
import { ROUTES } from '@/lib/constants';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

export default function TeacherCoursesPage() {
  const router = useRouter();
  const t = useTranslations('teacher');
  const tc = useTranslations('common');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const { data: courses, isLoading } = useMyCourses();
  const publishMutation = usePublishCourse();
  const archiveMutation = useArchiveCourse();

  /** Debounced search */
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(e.target.value);
    }, 300);
  }, []);

  /** Шүүлтүүрлэх */
  const filteredCourses = courses
    ?.filter((c: Course) => statusFilter === 'all' || c.status === statusFilter)
    ?.filter(
      (c: Course) => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: tc('all') },
    { key: 'published', label: t('published') },
    { key: 'draft', label: t('draft') },
    { key: 'archived', label: t('archived') },
  ];

  /** Нийтлэх */
  const handlePublish = (courseId: string) => {
    publishMutation.mutate(courseId, {
      onSuccess: () => toast.success(t('coursePublished')),
      onError: () => toast.error(tc('error')),
    });
  };

  /** Архивлах */
  const handleArchive = (courseId: string) => {
    archiveMutation.mutate(courseId, {
      onSuccess: () => toast.success(t('courseArchived')),
      onError: () => toast.error(tc('error')),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          icon={BookOpen}
          title={t('myCourses')}
          className="mb-6"
          actions={
            <div className="flex items-center gap-4">
              <div className="relative w-64 hidden md:block">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  onChange={handleSearch}
                  placeholder={tc('search')}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => router.push(ROUTES.TEACHER_COURSE_NEW)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <PlusCircle className="size-4" />
                {t('createCourse')}
              </button>
            </div>
          }
        />
        {/* Filter tabs + тоо */}
        <div className="flex items-center justify-between mb-6">
          <FilterTabs
            tabs={filters.map((f) => ({ value: f.key, label: f.label }))}
            activeValue={statusFilter}
            onChange={setStatusFilter}
          />
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {t('totalCoursesCount', { count: filteredCourses?.length ?? 0 })}
          </div>
        </div>

        {/* Хүснэгт */}
        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-lg" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : !filteredCourses?.length ? (
          <EmptyState
            icon={BookOpen}
            title={t('noCourses')}
            description={t('noCoursesDesc')}
            action={{ label: t('createCourse'), href: ROUTES.TEACHER_COURSE_NEW }}
          />
        ) : (
          <TeacherCoursesTable
            courses={filteredCourses}
            onPublish={handlePublish}
            onArchive={handleArchive}
          />
        )}
      </div>
    </div>
  );
}
