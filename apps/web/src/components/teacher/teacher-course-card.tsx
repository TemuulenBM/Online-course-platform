'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, Settings, MoreHorizontal, Pencil, Globe, Archive, Trash2 } from 'lucide-react';
import type { Course } from '@ocp/shared-types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/constants';

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

const difficultyLabels: Record<string, string> = {
  beginner: 'diffBeginner',
  intermediate: 'diffIntermediate',
  advanced: 'diffAdvanced',
};

interface TeacherCourseCardProps {
  course: Course;
  userRole?: string;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onPublish: (courseId: string) => void;
  onArchive: (courseId: string) => void;
}

export function TeacherCourseCard({
  course,
  userRole,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
}: TeacherCourseCardProps) {
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
          className={`absolute top-3 left-3 ${statusColors[course.status] || statusColors.draft}`}
        >
          {t(course.status as 'draft' | 'published' | 'archived')}
        </Badge>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2.5 right-2.5 size-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(course)}>
              <Pencil className="size-4 mr-2" />
              {t('editDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.TEACHER_CURRICULUM(course.id)}>
                <Settings className="size-4 mr-2" />
                {t('manageCurriculum')}
              </Link>
            </DropdownMenuItem>

            {(course.status === 'draft' || course.status === 'published') && (
              <>
                <DropdownMenuSeparator />
                {course.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onPublish(course.id)}>
                    <Globe className="size-4 mr-2" />
                    {t('publishCourse')}
                  </DropdownMenuItem>
                )}
                {course.status === 'published' && (
                  <DropdownMenuItem onClick={() => onArchive(course.id)}>
                    <Archive className="size-4 mr-2" />
                    {t('archiveCourse')}
                  </DropdownMenuItem>
                )}
              </>
            )}

            {userRole === 'admin' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(course)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="size-4 mr-2" />
                  {t('deleteCourse')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{course.title}</h3>

        <div className="flex items-center gap-2 flex-wrap">
          {course.difficulty && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {t(
                difficultyLabels[course.difficulty] as
                  | 'diffBeginner'
                  | 'diffIntermediate'
                  | 'diffAdvanced',
              )}
            </Badge>
          )}
          {course.price != null && course.price > 0 ? (
            <span className="text-xs font-medium text-gray-700">
              {course.discountPrice != null && course.discountPrice > 0 ? (
                <>
                  <span className="line-through text-gray-400 mr-1">{course.price}₮</span>
                  {course.discountPrice}₮
                </>
              ) : (
                `${course.price}₮`
              )}
            </span>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {t('free')}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
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
