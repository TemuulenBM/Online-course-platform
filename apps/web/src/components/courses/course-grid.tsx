'use client';

import type { Course } from '@ocp/shared-types';
import { CourseCard } from './course-card';

interface CourseGridProps {
  courses: Course[];
}

/** Responsive course card grid */
export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
