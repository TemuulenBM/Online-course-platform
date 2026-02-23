'use client';

import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseOverview } from './course-overview';
import { CourseCurriculum } from './course-curriculum';

interface CourseTabsProps {
  course: Course;
}

/** Тойм / Хичээлийн хөтөлбөр табууд */
export function CourseTabs({ course }: CourseTabsProps) {
  const t = useTranslations('courses');

  return (
    <Tabs defaultValue="overview">
      <TabsList className="bg-transparent border-b border-slate-200 dark:border-slate-700 rounded-none w-full justify-start gap-4 p-0 h-auto">
        <TabsTrigger
          value="overview"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent px-0 pb-3 font-bold"
        >
          {t('overview')}
        </TabsTrigger>
        <TabsTrigger
          value="curriculum"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent px-0 pb-3 font-bold"
        >
          {t('curriculum')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <CourseOverview description={course.description} tags={course.tags} />
      </TabsContent>
      <TabsContent value="curriculum">
        <CourseCurriculum courseId={course.id} />
      </TabsContent>
    </Tabs>
  );
}
