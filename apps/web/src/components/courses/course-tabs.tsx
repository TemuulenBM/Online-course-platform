'use client';

import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseCurriculum } from './course-curriculum';
import { CourseReviews } from './course-reviews';
import { CourseDiscussion } from './course-discussion';

interface CourseTabsProps {
  course: Course;
}

const triggerClassName =
  'rounded-none border-none! bg-transparent! px-1 pb-3 font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white data-[state=active]:text-primary! after:bg-primary! shadow-none!';

/** Хичээлийн хөтөлбөр / Сэтгэгдэл / Хэлэлцүүлэг — 3 таб (overview hero-д шилжсэн) */
export function CourseTabs({ course }: CourseTabsProps) {
  const t = useTranslations('courses');

  return (
    <Tabs defaultValue="curriculum">
      <TabsList
        variant="line"
        className="w-full justify-start gap-6 p-0 h-auto border-b border-slate-200 dark:border-slate-700"
      >
        <TabsTrigger value="curriculum" className={triggerClassName}>
          {t('curriculum')}
        </TabsTrigger>
        <TabsTrigger value="reviews" className={triggerClassName}>
          {t('reviews')}
        </TabsTrigger>
        <TabsTrigger value="discussion" className={triggerClassName}>
          {t('discussion')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="curriculum">
        <CourseCurriculum courseId={course.id} slug={course.slug} />
      </TabsContent>
      <TabsContent value="reviews">
        <CourseReviews />
      </TabsContent>
      <TabsContent value="discussion">
        <CourseDiscussion courseId={course.id} />
      </TabsContent>
    </Tabs>
  );
}
