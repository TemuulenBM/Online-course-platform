'use client';

import { useTranslations } from 'next-intl';

interface LessonVideoMetaProps {
  description?: string;
}

/** Видео хичээлийн доод хэсэгт тайлбар card */
export function LessonVideoMeta({ description }: LessonVideoMetaProps) {
  const t = useTranslations('lessonViewer');

  if (!description) return null;

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-primary/5 shadow-sm">
      <h2 className="text-xl font-bold mb-3">{t('videoDescription')}</h2>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
