'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { Lesson, LessonType } from '@ocp/shared-types';

import {
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useTogglePublishLesson,
  useReorderLessons,
} from '@/hooks/api';
import { LessonListItem } from './lesson-list-item';
import { LessonFormDialog } from './lesson-form-dialog';
import { DeleteLessonDialog } from './delete-lesson-dialog';
import { LessonContentEditor } from './lesson-content-editor';

interface LessonListProps {
  courseId: string;
  lessons: Lesson[];
}

export function LessonList({ courseId, lessons }: LessonListProps) {
  const t = useTranslations('teacher');

  /* --- Mutations --- */
  const createMutation = useCreateLesson(courseId);
  const updateMutation = useUpdateLesson(courseId);
  const deleteMutation = useDeleteLesson(courseId);
  const togglePublishMutation = useTogglePublishLesson(courseId);
  const reorderMutation = useReorderLessons(courseId);

  /* --- Dialog states --- */
  const [formOpen, setFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [contentLesson, setContentLesson] = useState<Lesson | null>(null);

  /* --- DnD sensors --- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /* --- Handlers --- */
  const handleCreate = () => {
    setEditingLesson(null);
    setFormOpen(true);
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormOpen(true);
  };

  const handleDeleteClick = (lesson: Lesson) => {
    setDeletingLesson(lesson);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (data: {
    title: string;
    lessonType: LessonType;
    durationMinutes?: number;
    isPreview?: boolean;
  }) => {
    if (editingLesson) {
      updateMutation.mutate(
        { id: editingLesson.id, data },
        {
          onSuccess: () => {
            toast.success(t('lessonUpdated'));
            setFormOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(
        { ...data, courseId },
        {
          onSuccess: () => {
            toast.success(t('lessonCreated'));
            setFormOpen(false);
          },
        },
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingLesson) return;
    deleteMutation.mutate(deletingLesson.id, {
      onSuccess: () => {
        toast.success(t('lessonDeleted'));
        setDeleteOpen(false);
        setDeletingLesson(null);
        if (contentLesson?.id === deletingLesson.id) {
          setContentLesson(null);
        }
      },
    });
  };

  const handleTogglePublish = (lesson: Lesson) => {
    togglePublishMutation.mutate(lesson.id);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      /* Шинэ дараалал тооцоолох */
      const reordered = [...lessons];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const items = reordered.map((l, idx) => ({
        lessonId: l.id,
        orderIndex: idx,
      }));

      reorderMutation.mutate({ courseId, items });
    },
    [lessons, courseId, reorderMutation],
  );

  const sorted = [...lessons].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-4">
      {/* Lesson list with drag-and-drop */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-gray-500 font-medium">{t('noLessons')}</p>
          <p className="text-sm text-gray-400">{t('addFirstLesson')}</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={sorted.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sorted.map((lesson) => (
                <LessonListItem
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onTogglePublish={handleTogglePublish}
                  onSelectContent={setContentLesson}
                  isPublishPending={togglePublishMutation.isPending}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Content editor panel */}
      {contentLesson && (
        <LessonContentEditor lesson={contentLesson} onClose={() => setContentLesson(null)} />
      )}

      {/* "Хичээл нэмэх" товч хамгийн доод талд */}
      <button
        onClick={handleCreate}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + {t('createLesson')}
      </button>

      {/* Form dialog */}
      <LessonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editingLesson}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete dialog */}
      <DeleteLessonDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
        lessonTitle={deletingLesson?.title || ''}
      />
    </div>
  );
}
