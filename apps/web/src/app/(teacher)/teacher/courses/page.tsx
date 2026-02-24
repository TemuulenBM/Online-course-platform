'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BookOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Course } from '@ocp/shared-types';

import {
  useMyCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  usePublishCourse,
  useArchiveCourse,
} from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { TeacherCourseCard } from '@/components/teacher/teacher-course-card';
import { CourseFormDialog } from '@/components/teacher/course-form-dialog';
import { DeleteCourseDialog } from '@/components/teacher/delete-course-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

type StatusFilter = 'all' | 'draft' | 'published' | 'archived';

export default function TeacherCoursesPage() {
  const router = useRouter();
  const t = useTranslations('teacher');
  const tc = useTranslations('common');
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role?.toLowerCase();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const { data: courses, isLoading } = useMyCourses();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const publishMutation = usePublishCourse();
  const archiveMutation = useArchiveCourse();

  const filteredCourses =
    statusFilter === 'all' ? courses : courses?.filter((c: Course) => c.status === statusFilter);

  /** Шинэ сургалт үүсгэх dialog нээх */
  const handleCreate = () => {
    setEditingCourse(null);
    setFormOpen(true);
  };

  /** Сургалт засах dialog нээх */
  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormOpen(true);
  };

  /** Form submit — create эсвэл update */
  const handleFormSubmit = (data: {
    title: string;
    description: string;
    categoryId: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    price?: number;
    discountPrice?: number;
    language?: string;
    tags?: string[];
  }) => {
    if (editingCourse) {
      updateMutation.mutate(
        { id: editingCourse.id, data },
        {
          onSuccess: () => {
            toast.success(t('courseUpdated'));
            setFormOpen(false);
            setEditingCourse(null);
          },
          onError: () => toast.error(tc('error')),
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (course) => {
          toast.success(t('courseCreated'));
          setFormOpen(false);
          router.push(ROUTES.TEACHER_CURRICULUM(course.id));
        },
        onError: () => toast.error(tc('error')),
      });
    }
  };

  /** Устгах dialog нээх */
  const handleDeleteClick = (course: Course) => {
    setDeletingCourse(course);
    setDeleteOpen(true);
  };

  /** Устгах баталгаажуулах */
  const handleDeleteConfirm = () => {
    if (!deletingCourse) return;
    deleteMutation.mutate(deletingCourse.id, {
      onSuccess: () => {
        toast.success(t('courseDeleted'));
        setDeleteOpen(false);
        setDeletingCourse(null);
      },
      onError: () => toast.error(tc('error')),
    });
  };

  /** Нийтлэх */
  const handlePublish = (courseId: string) => {
    publishMutation.mutate(courseId, {
      onSuccess: () => toast.success(t('coursePublished')),
      onError: () => toast.error(tc('error')),
    });
  };

  /** Архивлах */
  const handleArchive = (courseId: string) => {
    archiveMutation.mutate(courseId, {
      onSuccess: () => toast.success(t('courseArchived')),
      onError: () => toast.error(tc('error')),
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl font-bold">{t('myCourses')}</h1>
        </div>
        <Button onClick={handleCreate} className="gap-1.5">
          <Plus className="size-4" />
          {t('createCourse')}
        </Button>
      </div>

      {/* Status filter tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="all">{tc('all')}</TabsTrigger>
          <TabsTrigger value="draft">{t('draft')}</TabsTrigger>
          <TabsTrigger value="published">{t('published')}</TabsTrigger>
          <TabsTrigger value="archived">{t('archived')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Course grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : !filteredCourses?.length ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen className="size-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 font-medium">{t('noCourses')}</p>
          <p className="text-sm text-gray-400">{t('noCoursesDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Course) => (
            <TeacherCourseCard
              key={course.id}
              course={course}
              userRole={userRole}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPublish={handlePublish}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CourseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        course={editingCourse}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteCourseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        courseTitle={deletingCourse?.title || ''}
      />
    </div>
  );
}
