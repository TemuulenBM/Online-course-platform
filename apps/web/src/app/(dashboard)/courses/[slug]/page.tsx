'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useCourseBySlug } from '@/hooks/api';
import { CourseDetailHeader } from '@/components/courses/course-detail-header';
import { CourseHero } from '@/components/courses/course-hero';
import { CourseTabs } from '@/components/courses/course-tabs';
import { CourseSidebarMeta } from '@/components/courses/course-sidebar-meta';
import { CourseDetailSkeleton } from '@/components/courses/course-detail-skeleton';

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslations('common');
  const { data: course, isLoading, error } = useCourseBySlug(slug);

  if (isLoading) return <CourseDetailSkeleton />;

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500">
        {t('error')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <CourseDetailHeader courseTitle={course.title} />
      <div className="flex flex-col xl:flex-row gap-8 max-w-6xl">
        {/* Үндсэн контент */}
        <div className="flex-1 flex flex-col gap-8 max-w-[800px]">
          <CourseHero course={course} />
          <CourseTabs course={course} />
        </div>
        {/* Баруун sidebar */}
        <aside className="w-full xl:w-[320px] shrink-0">
          <CourseSidebarMeta course={course} />
        </aside>
      </div>
    </div>
  );
}
