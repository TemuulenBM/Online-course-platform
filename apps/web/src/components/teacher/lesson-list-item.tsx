'use client';

import { useTranslations } from 'next-intl';
import {
  GripVertical,
  Pencil,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  Radio,
  Eye,
} from 'lucide-react';
import type { Lesson, LessonType } from '@ocp/shared-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const typeIcons: Record<LessonType, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  live: Radio,
};

interface LessonListItemProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onTogglePublish: (lesson: Lesson) => void;
  onSelectContent: (lesson: Lesson) => void;
  isPublishPending: boolean;
}

export function LessonListItem({
  lesson,
  onEdit,
  onDelete,
  onTogglePublish,
  onSelectContent,
  isPublishPending,
}: LessonListItemProps) {
  const t = useTranslations('teacher');
  const Icon = typeIcons[lesson.lessonType] || FileText;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white border rounded-xl p-3 hover:shadow-sm transition-shadow group"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Type icon */}
      <div className="size-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon className="size-4 text-gray-500" />
      </div>

      {/* Title + meta — content засах */}
      <button className="flex-1 min-w-0 text-left" onClick={() => onSelectContent(lesson)}>
        <p className="text-sm font-medium truncate">{lesson.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 capitalize">{t(lesson.lessonType)}</span>
          {lesson.durationMinutes > 0 && (
            <span className="text-xs text-gray-400">{lesson.durationMinutes} мин</span>
          )}
        </div>
      </button>

      {/* Preview badge */}
      {lesson.isPreview && (
        <Badge variant="outline" className="gap-1 text-xs">
          <Eye className="size-3" />
          Preview
        </Badge>
      )}

      {/* Publish toggle */}
      <Switch
        checked={lesson.isPublished}
        onCheckedChange={() => onTogglePublish(lesson)}
        disabled={isPublishPending}
        aria-label={lesson.isPublished ? t('unpublish') : t('publish')}
      />

      {/* Edit */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onEdit(lesson)}
      >
        <Pencil className="size-3.5" />
      </Button>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
        onClick={() => onDelete(lesson)}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
