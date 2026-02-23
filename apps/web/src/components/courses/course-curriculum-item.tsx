'use client';

import { PlayCircle, FileText, HelpCircle, ClipboardCheck, Radio } from 'lucide-react';
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

interface CourseCurriculumItemProps {
  lesson: Lesson;
  index: number;
  slug?: string;
}

/** Нэг хичээлийн мөр — дарахад lesson viewer руу шилжинэ */
export function CourseCurriculumItem({ lesson, index, slug }: CourseCurriculumItemProps) {
  const t = useTranslations('courses');
  const router = useRouter();
  const Icon = lessonTypeIcons[lesson.lessonType] || FileText;

  const handleClick = () => {
    if (slug) {
      router.push(ROUTES.LESSON_VIEWER(slug, lesson.id));
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${slug ? 'cursor-pointer' : ''}`}
    >
      <span className="text-xs font-bold text-slate-400 w-6 text-center">{index}</span>
      <Icon className="size-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-slate-900 dark:text-white text-sm truncate block">
          {lesson.title}
        </span>
      </div>
      {lesson.isPreview && (
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {t('preview')}
        </span>
      )}
      <span className="text-xs text-slate-400 font-medium shrink-0">
        {lesson.durationMinutes} {t('minutes')}
      </span>
    </div>
  );
}
