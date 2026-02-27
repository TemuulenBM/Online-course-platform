'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { ManualGradingPanel } from '@/components/quiz/ManualGradingPanel';
import { useQuizByLessonId } from '@/hooks/api/use-quizzes';

/**
 * Гараар дүгнэх хуудас — Багш/Админ.
 * Essay/code асуултуудын хариултыг дүгнэнэ.
 */
export default function ManualGradingPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string; attemptId: string }>;
}) {
  const { courseId, lessonId, attemptId } = use(params);
  const t = useTranslations('quiz');
  const { data: quiz } = useQuizByLessonId(lessonId);

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <a href="/teacher/courses" className="text-muted-foreground hover:text-primary">
          Dashboard
        </a>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <a
          href={`/teacher/courses/${courseId}/lessons/${lessonId}/quiz/attempts`}
          className="text-muted-foreground hover:text-primary"
        >
          {t('quizAttempts')}
        </a>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <span className="font-medium text-primary">{t('manualGrading')}</span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground">{t('manualGrading')}</h1>
      </div>

      <ManualGradingPanel attemptId={attemptId} quizId={quiz?.id || ''} />
    </div>
  );
}
