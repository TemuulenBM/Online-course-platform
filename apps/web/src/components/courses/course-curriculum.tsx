'use client';

import { useTranslations } from 'next-intl';
import { useCourseLessons } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseCurriculumItem } from './course-curriculum-item';

interface CourseCurriculumProps {
  courseId: string;
  slug?: string;
}

/** Хичээлийн хөтөлбөр жагсаалт */
export function CourseCurriculum({ courseId, slug }: CourseCurriculumProps) {
  const t = useTranslations('courses');
  const { data: lessons, isLoading } = useCourseLessons(courseId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 pt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!lessons?.length) {
    return (
      <div className="pt-6 text-center text-slate-500 py-10">{t('lessonCount', { count: 0 })}</div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pt-6">
      <span className="text-sm text-slate-500 font-medium mb-2">
        {t('lessonCount', { count: lessons.length })}
      </span>
      {lessons.map((lesson, idx) => (
        <CourseCurriculumItem key={lesson.id} lesson={lesson} index={idx + 1} slug={slug} />
      ))}
    </div>
  );
}
