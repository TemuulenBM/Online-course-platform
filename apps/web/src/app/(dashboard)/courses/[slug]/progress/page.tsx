'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCourseBySlug, useCourseProgress } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { CourseProgressHeader } from '@/components/progress/course-progress-header';
import { LessonProgressList } from '@/components/progress/lesson-progress-list';
import { CourseProgressSkeleton } from '@/components/progress/course-progress-skeleton';

export default function CourseProgressPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const t = useTranslations('progress');
  const tn = useTranslations('nav');

  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug);
  const courseId = course?.id || '';
  const { data: progress, isLoading: progressLoading } = useCourseProgress(courseId);

  const isLoading = courseLoading || progressLoading;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <h2 className="text-xl font-bold">{t('courseProgress')}</h2>
        </div>
      </header>

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href={ROUTES.DASHBOARD} className="hover:text-primary transition-colors">
            {tn('dashboard')}
          </Link>
          <ChevronRight className="size-3" />
          <Link href={ROUTES.COURSES} className="hover:text-primary transition-colors">
            {tn('courses')}
          </Link>
          <ChevronRight className="size-3" />
          {course && (
            <>
              <Link
                href={ROUTES.COURSE_DETAIL(slug)}
                className="hover:text-primary transition-colors"
              >
                {course.title}
              </Link>
              <ChevronRight className="size-3" />
            </>
          )}
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            {t('courseProgress')}
          </span>
        </div>

        {/* Content */}
        {isLoading || !course || !progress ? (
          <CourseProgressSkeleton />
        ) : (
          <>
            <CourseProgressHeader
              courseProgress={progress}
              courseTitle={course.title}
              courseSlug={slug}
            />
            <LessonProgressList lessons={progress.lessons} courseSlug={slug} />
          </>
        )}
      </div>
    </div>
  );
}
