'use client';

import { use } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCourseById, useCourseLessons } from '@/hooks/api';
import { LessonList } from '@/components/teacher/lesson-list';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

interface CurriculumPageProps {
  params: Promise<{ courseId: string }>;
}

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

export default function CurriculumPage({ params }: CurriculumPageProps) {
  const { courseId } = use(params);
  const t = useTranslations('teacher');
  const { data: course, isLoading: courseLoading } = useCourseById(courseId);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(courseId);

  const isLoading = courseLoading || lessonsLoading;

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Буцах товч */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <Link
          href={ROUTES.TEACHER_COURSES}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t('backToCourses')}
        </Link>
      </div>

      {/* Header */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      ) : course ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <Badge className={statusColors[course.status] || statusColors.draft}>
              {t(course.status as 'draft' | 'published' | 'archived')}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            {t('totalLessons', { count: lessons?.length || 0 })}
          </p>
        </div>
      ) : null}

      {/* Lesson list */}
      {lessonsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <LessonList courseId={courseId} lessons={lessons || []} />
      )}
    </div>
  );
}
