'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Pencil, Globe, Archive, PlusCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  useCourseById,
  useCourseLessons,
  useUpdateCourse,
  usePublishCourse,
  useArchiveCourse,
} from '@/hooks/api';
import { LessonList } from '@/components/teacher/lesson-list';
import { CourseFormDialog } from '@/components/teacher/course-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

interface CurriculumPageProps {
  params: Promise<{ courseId: string }>;
}

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

export default function CurriculumPage({ params }: CurriculumPageProps) {
  const { courseId } = use(params);
  const t = useTranslations('teacher');
  const tc = useTranslations('common');
  const { data: course, isLoading: courseLoading } = useCourseById(courseId);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(courseId);

  const [editOpen, setEditOpen] = useState(false);
  const updateMutation = useUpdateCourse();
  const publishMutation = usePublishCourse();
  const archiveMutation = useArchiveCourse();

  const isLoading = courseLoading || lessonsLoading;

  const handleEditSubmit = (data: {
    title: string;
    description: string;
    categoryId: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    price?: number;
    discountPrice?: number;
    language?: string;
    tags?: string[];
  }) => {
    updateMutation.mutate(
      { id: courseId, data },
      {
        onSuccess: () => {
          toast.success(t('courseUpdated'));
          setEditOpen(false);
        },
        onError: () => toast.error(tc('error')),
      },
    );
  };

  const handlePublish = () => {
    publishMutation.mutate(courseId, {
      onSuccess: () => toast.success(t('coursePublished')),
      onError: () => toast.error(tc('error')),
    });
  };

  const handleArchive = () => {
    archiveMutation.mutate(courseId, {
      onSuccess: () => toast.success(t('courseArchived')),
      onError: () => toast.error(tc('error')),
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-2 text-primary">
            <Pencil className="size-6" />
            <h2 className="text-xl font-bold tracking-tight">{t('manageLessonsTitle')}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {course?.status === 'draft' && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="gap-1.5"
            >
              <Globe className="size-3.5" />
              {publishMutation.isPending ? t('publishing') : t('publishCourse')}
            </Button>
          )}
          {course?.status === 'published' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
              className="gap-1.5"
            >
              <Archive className="size-3.5" />
              {archiveMutation.isPending ? t('archiving') : t('archiveCourse')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
            <Pencil className="size-3.5" />
            {t('editDetails')}
          </Button>
        </div>
      </header>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Breadcrumbs & Intro */}
        <div className="space-y-2">
          <nav className="flex text-xs font-medium text-slate-400 gap-2 items-center">
            <Link href={ROUTES.TEACHER_COURSES} className="hover:text-primary transition-colors">
              {t('myCourses')}
            </Link>
            <ChevronRight className="size-3" />
            {course && (
              <>
                <span className="hover:text-primary transition-colors">{course.title}</span>
                <ChevronRight className="size-3" />
              </>
            )}
            <span className="text-primary font-bold">{t('manageLessonsTitle')}</span>
          </nav>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          ) : course ? (
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t('manageLessonsTitle')}
                  </h3>
                  <Badge className={statusColors[course.status] || statusColors.draft}>
                    {t(course.status as 'draft' | 'published' | 'archived')}
                  </Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {t('manageLessonsDesc', { count: lessons?.length || 0 })}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Lesson list (table) */}
        {lessonsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <LessonList courseId={courseId} lessons={lessons || []} courseName={course?.title} />
        )}
      </div>

      {/* Сургалт засах dialog */}
      {course && (
        <CourseFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          course={course}
          onSubmit={handleEditSubmit}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}
