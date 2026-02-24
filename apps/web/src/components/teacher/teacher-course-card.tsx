'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, Settings } from 'lucide-react';
import type { Course } from '@ocp/shared-types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

interface TeacherCourseCardProps {
  course: Course;
}

export function TeacherCourseCard({ course }: TeacherCourseCardProps) {
  const t = useTranslations('teacher');

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="size-10 text-gray-300" />
          </div>
        )}
        <Badge
          className={`absolute top-3 right-3 ${statusColors[course.status] || statusColors.draft}`}
        >
          {t(course.status as 'draft' | 'published' | 'archived')}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{course.title}</h3>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {course.durationMinutes ? `${course.durationMinutes} мин` : ''}
          </span>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href={ROUTES.TEACHER_CURRICULUM(course.id)}>
              <Settings className="size-3.5" />
              {t('manageCurriculum')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
