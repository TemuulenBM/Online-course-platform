'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen } from 'lucide-react';

import { useMyCourses } from '@/hooks/api';
import { TeacherCourseCard } from '@/components/teacher/teacher-course-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course } from '@ocp/shared-types';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

export default function TeacherCoursesPage() {
  const t = useTranslations('teacher');
  const tc = useTranslations('common');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { data: courses, isLoading } = useMyCourses();

  const filteredCourses =
    statusFilter === 'all' ? courses : courses?.filter((c: Course) => c.status === statusFilter);

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl font-bold">{t('myCourses')}</h1>
        </div>
      </div>

      {/* Status filter tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="all">{tc('all')}</TabsTrigger>
          <TabsTrigger value="draft">{t('draft')}</TabsTrigger>
          <TabsTrigger value="published">{t('published')}</TabsTrigger>
          <TabsTrigger value="archived">{t('archived')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Course grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : !filteredCourses?.length ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen className="size-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium">{t('noCourses')}</p>
          <p className="text-sm text-gray-400">{t('noCoursesDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Course) => (
            <TeacherCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
