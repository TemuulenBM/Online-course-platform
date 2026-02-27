'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { QuizManagementForm } from '@/components/quiz/QuizManagementForm';

/**
 * Quiz тохиргоо хуудас — Багш/Админ.
 * QuizManagementForm компонентыг ашиглана.
 */
export default function QuizManagementPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const t = useTranslations('quiz');

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <a href="/teacher/courses" className="text-muted-foreground hover:text-primary">
          Dashboard
        </a>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <a
          href={`/teacher/courses/${courseId}/curriculum`}
          className="text-muted-foreground hover:text-primary"
        >
          Courses
        </a>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <span className="font-medium text-primary">{t('quizSettings')}</span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground">{t('quizSettings')}</h1>
        <p className="text-muted-foreground mt-2">{t('quizSettingsDesc')}</p>
      </div>

      {/* Форм */}
      <QuizManagementForm lessonId={lessonId} courseId={courseId} />
    </div>
  );
}
