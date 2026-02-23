'use client';

import type { Course } from '@ocp/shared-types';
import { CourseCard } from './course-card';

interface CourseGridProps {
  courses: Course[];
}

/** Responsive course card grid */
export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
