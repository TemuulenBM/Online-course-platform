'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CourseDiscussionProps {
  courseId: string;
}

/** Хэлэлцүүлэг таб — placeholder (ирээдүйд discussions API-тай холбоно) */
export function CourseDiscussion({ courseId: _courseId }: CourseDiscussionProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-[#8A93E5]/10 flex items-center justify-center mb-4">
        <MessageCircle className="size-7 text-[#8A93E5]" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">{t('noDiscussions')}</p>
    </div>
  );
}
