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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <CourseDetailHeader courseTitle={course.title} categoryName={course.categoryName} />

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Үндсэн контент */}
          <div className="md:col-span-8 space-y-6">
            <CourseHero course={course} />
            <CourseTabs course={course} />
          </div>

          {/* Баруун sidebar */}
          <div className="md:col-span-4">
            <CourseSidebarMeta course={course} />
          </div>
        </div>
      </div>
    </div>
  );
}
