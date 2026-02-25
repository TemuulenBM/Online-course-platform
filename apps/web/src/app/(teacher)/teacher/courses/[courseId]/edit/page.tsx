'use client';

import { use } from 'react';
import { useCourseById } from '@/hooks/api';
import { CourseFormPage } from '@/components/teacher/course-form-page';
import { Skeleton } from '@/components/ui/skeleton';

/** Сургалт засах хуудас */
export default function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { data: course, isLoading } = useCourseById(courseId);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return <CourseFormPage course={course} />;
}
