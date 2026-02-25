'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  GripVertical,
  Pencil,
  Trash2,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  Radio,
  CheckCircle2,
  XCircle,
  FileEdit,
} from 'lucide-react';
import type { Lesson, LessonType } from '@ocp/shared-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Switch } from '@/components/ui/switch';
import { ROUTES } from '@/lib/constants';

/** Хичээлийн төрлийн icon-ууд */
const typeIcons: Record<LessonType, React.ElementType> = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  live: Radio,
};

/** Төрлийн badge стилүүд */
const typeBadgeStyles: Record<LessonType, string> = {
  video:
    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  text: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  quiz: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  assignment:
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  live: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
};

/** Төрлийн label */
const typeLabels: Record<LessonType, string> = {
  video: 'Video',
  text: 'Doc',
  quiz: 'Quiz',
  assignment: 'Task',
  live: 'Live',
};

/** Duration-г MM:SS формат руу хөрвүүлэх */
function formatDuration(minutes: number): string {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface LessonListItemProps {
  lesson: Lesson;
  courseId: string;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onTogglePreview: (lesson: Lesson) => void;
}

/** Багшийн хичээлийн жагсаалтын нэг мөр — table row */
export function LessonListItem({
  lesson,
  courseId,
  onEdit,
  onDelete,
  onTogglePreview,
}: LessonListItemProps) {
  const t = useTranslations('teacher');
  const router = useRouter();
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
    <tr ref={setNodeRef} style={style} className="group hover:bg-primary/5 transition-colors">
      {/* # */}
      <td className="py-5 px-6 font-medium text-slate-400">
        {String(lesson.orderIndex + 1).padStart(2, '0')}
      </td>

      {/* Drag handle */}
      <td className="py-5 px-2">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 group-hover:text-primary cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="size-5" />
        </button>
      </td>

      {/* Гарчиг + icon */}
      <td className="py-5 px-6">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => router.push(ROUTES.TEACHER_LESSON_CONTENT(courseId, lesson.id))}
        >
          <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
              {lesson.title}
            </p>
            <p className="text-xs text-slate-500 truncate">{t(lesson.lessonType)}</p>
          </div>
        </button>
      </td>

      {/* Төрөл badge */}
      <td className="py-5 px-6">
        <span
          className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide border ${typeBadgeStyles[lesson.lessonType]}`}
        >
          {typeLabels[lesson.lessonType]}
        </span>
      </td>

      {/* Хугацаа */}
      <td className="py-5 px-6 text-sm text-center text-slate-500 font-medium">
        {lesson.durationMinutes > 0 ? formatDuration(lesson.durationMinutes) : '—'}
      </td>

      {/* Preview toggle */}
      <td className="py-5 px-6 text-center">
        <div className="flex justify-center">
          <Switch checked={lesson.isPreview} onCheckedChange={() => onTogglePreview(lesson)} />
        </div>
      </td>

      {/* Нийтэлсэн */}
      <td className="py-5 px-6 text-center">
        <div className="flex items-center justify-center">
          {lesson.isPublished ? (
            <CheckCircle2 className="size-5 text-green-500" />
          ) : (
            <XCircle className="size-5 text-slate-300" />
          )}
        </div>
      </td>

      {/* Үйлдэл */}
      <td className="py-5 px-6 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => router.push(ROUTES.TEACHER_LESSON_CONTENT(courseId, lesson.id))}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title={t('editContentTitle')}
          >
            <FileEdit className="size-5" />
          </button>
          <button
            onClick={() => onEdit(lesson)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title={t('editLesson')}
          >
            <Pencil className="size-5" />
          </button>
          <button
            onClick={() => onDelete(lesson)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title={t('deleteLesson')}
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
