'use client';

import {
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardCheck,
  Radio,
  Clock,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Lesson, LessonType } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';

/** Хичээлийн төрлийн icon */
const lessonTypeIcons: Record<LessonType, React.ElementType> = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  assignment: ClipboardCheck,
  live: Radio,
};

/** Хичээлийн төрлийн монгол label */
const lessonTypeLabels: Record<LessonType, string> = {
  video: 'Видео',
  text: 'Текст',
  quiz: 'Тест',
  assignment: 'Даалгавар',
  live: 'Шууд',
};

interface CourseCurriculumItemProps {
  lesson: Lesson;
  index: number;
  slug?: string;
  isEnrolled: boolean;
}

/** Нэг хичээлийн мөр — free/locked ялгаатай дизайн */
export function CourseCurriculumItem({
  lesson,
  index,
  slug,
  isEnrolled,
}: CourseCurriculumItemProps) {
  const t = useTranslations('lessonViewer');
  const router = useRouter();
  const Icon = lessonTypeIcons[lesson.lessonType] || FileText;
  const isAccessible = lesson.isPreview || isEnrolled;

  const handleClick = () => {
    if (slug && isAccessible) {
      router.push(ROUTES.LESSON_VIEWER(slug, lesson.id));
    }
  };

  /** Locked хичээл */
  if (!isAccessible) {
    return (
      <div className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 opacity-80">
        <div className="flex items-center gap-6">
          <span className="text-xl font-black text-slate-200 dark:text-slate-800 w-6">
            {String(index).padStart(2, '0')}
          </span>
          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Icon className="size-6" />
          </div>
          <div>
            <h4 className="text-slate-500 dark:text-slate-500 font-bold">{lesson.title}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-bold text-slate-300 dark:text-slate-700 uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {lessonTypeLabels[lesson.lessonType]}
              </span>
              {lesson.durationMinutes > 0 && (
                <span className="text-xs text-slate-300 dark:text-slate-700 flex items-center gap-1">
                  <Clock className="size-3.5" /> {lesson.durationMinutes} мин
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Lock className="size-5 text-slate-300 dark:text-slate-700" />
        </div>
      </div>
    );
  }

  /** Free / Enrolled хичээл */
  return (
    <div
      onClick={handleClick}
      className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-6">
        <span className="text-xl font-black text-slate-300 dark:text-slate-700 w-6">
          {String(index).padStart(2, '0')}
        </span>
        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="size-6" />
        </div>
        <div>
          <h4 className="text-slate-900 dark:text-white font-bold group-hover:text-primary transition-colors">
            {lesson.title}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {lessonTypeLabels[lesson.lessonType]}
            </span>
            {lesson.durationMinutes > 0 && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="size-3.5" /> {lesson.durationMinutes} мин
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {lesson.isPreview && !isEnrolled && (
          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full">
            {t('free')}
          </span>
        )}
        <ChevronRight className="size-5 text-slate-300 dark:text-slate-700" />
      </div>
    </div>
  );
}
