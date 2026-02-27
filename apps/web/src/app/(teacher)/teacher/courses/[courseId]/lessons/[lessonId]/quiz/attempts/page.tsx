'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, Loader2 } from 'lucide-react';
import { StudentAttemptsTable } from '@/components/quiz/StudentAttemptsTable';
import { useQuizByLessonId } from '@/hooks/api/use-quizzes';

/**
 * Оюутнуудын оролдлогын жагсаалт хуудас — Багш/Админ.
 */
export default function StudentAttemptsPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const t = useTranslations('quiz');
  const { data: quiz, isLoading } = useQuizByLessonId(lessonId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <a href="/teacher/courses" className="text-muted-foreground hover:text-primary">
          Dashboard
        </a>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <a
          href={`/teacher/courses/${courseId}/lessons/${lessonId}/quiz`}
          className="text-muted-foreground hover:text-primary"
        >
          Quiz
        </a>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <span className="font-medium text-primary">{t('quizAttempts')}</span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground">{t('quizAttempts')}</h1>
        <p className="text-muted-foreground mt-2">
          &quot;{quiz.title}&quot; — {t('quizAttemptsDesc')}
        </p>
      </div>

      <StudentAttemptsTable quizId={quiz.id} courseId={courseId} lessonId={lessonId} />
    </div>
  );
}
