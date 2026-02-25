'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { PlusCircle, Clock, Eye, ClipboardCheck, Search } from 'lucide-react';
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
  courseName?: string;
}

export function LessonList({ courseId, lessons, courseName }: LessonListProps) {
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
  const [searchQuery, setSearchQuery] = useState('');

  /* --- DnD sensors --- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /* --- Computed --- */
  const sorted = useMemo(() => [...lessons].sort((a, b) => a.orderIndex - b.orderIndex), [lessons]);

  const filtered = useMemo(
    () =>
      searchQuery
        ? sorted.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : sorted,
    [sorted, searchQuery],
  );

  /** Stat тооцоолол */
  const totalDurationMinutes = useMemo(
    () => sorted.reduce((acc, l) => acc + (l.durationMinutes || 0), 0),
    [sorted],
  );
  const previewCount = useMemo(() => sorted.filter((l) => l.isPreview).length, [sorted]);

  const totalMinutes = Math.floor(totalDurationMinutes);
  const totalSeconds = Math.round((totalDurationMinutes - totalMinutes) * 60);

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
    isPublished?: boolean;
  }) => {
    if (editingLesson) {
      const { isPublished, ...updateData } = data;
      updateMutation.mutate(
        { id: editingLesson.id, data: updateData },
        {
          onSuccess: () => {
            /* Нийтлэлтийн статус өөрчлөгдсөн бол toggle хийх */
            if (isPublished !== undefined && isPublished !== editingLesson.isPublished) {
              togglePublishMutation.mutate(editingLesson.id);
            }
            toast.success(t('lessonUpdated'));
            setFormOpen(false);
          },
        },
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isPublished, ...createData } = data;
      createMutation.mutate(
        { ...createData, courseId },
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

  /** Preview toggle — update mutation ашиглана */
  const handleTogglePreview = (lesson: Lesson) => {
    updateMutation.mutate(
      { id: lesson.id, data: { isPreview: !lesson.isPreview } },
      {
        onSuccess: () => toast.success(t('lessonUpdated')),
      },
    );
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

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

  return (
    <div className="space-y-6">
      {/* Toolbar: Search + Add button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchLessons')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
          />
        </div>
        <button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <PlusCircle className="size-5" />
          <span>{t('addNewLesson')}</span>
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 && sorted.length === 0 ? (
        <div className="text-center py-16 space-y-2 bg-white dark:bg-slate-900 rounded-2xl border border-primary/5">
          <p className="text-slate-500 font-medium">{t('noLessons')}</p>
          <p className="text-sm text-slate-400">{t('addFirstLesson')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-primary/5 overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-primary/10">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">
                    #
                  </th>
                  <th className="py-4 px-2 w-10" />
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('tableTitle')}
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('tableType')}
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    {t('tableDuration')}
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    {t('tablePreview')}
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    {t('tablePublished')}
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    {t('tableActions')}
                  </th>
                </tr>
              </thead>
              <SortableContext
                items={filtered.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-primary/5">
                  {filtered.map((lesson) => (
                    <LessonListItem
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onTogglePreview={handleTogglePreview}
                      onSelectContent={setContentLesson}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>

          {/* Footer: Legend + count */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between border-t border-primary/10">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500 font-medium">{t('publishedStatus')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500 font-medium">{t('draftStatus')}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              {t('totalShowing', { count: filtered.length })}
            </p>
          </div>
        </div>
      )}

      {/* Content editor panel */}
      {contentLesson && (
        <LessonContentEditor lesson={contentLesson} onClose={() => setContentLesson(null)} />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 flex items-center gap-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('totalDuration')}</p>
            <p className="text-xl font-black">
              {totalMinutes}м {totalSeconds}с
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 flex items-center gap-4">
          <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <Eye className="size-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('previewCount')}</p>
            <p className="text-xl font-black">{t('previewLessonCount', { count: previewCount })}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-primary/5 flex items-center gap-4">
          <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ClipboardCheck className="size-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t('orderConfirmed')}</p>
            <p className="text-xl font-black">{t('orderConfirmedYes')}</p>
          </div>
        </div>
      </div>

      {/* Form dialog */}
      <LessonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editingLesson}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        courseName={courseName}
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
