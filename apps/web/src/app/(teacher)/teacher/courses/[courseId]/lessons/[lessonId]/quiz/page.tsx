'use client';

import { use } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { QuizManagementForm } from '@/components/quiz/QuizManagementForm';
import { ROUTES } from '@/lib/constants';

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
        <Link href={ROUTES.TEACHER_COURSES} className="text-muted-foreground hover:text-primary">
          Хянах самбар
        </Link>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <Link
          href={`/teacher/courses/${courseId}/curriculum`}
          className="text-muted-foreground hover:text-primary"
        >
          Хичээлийн жагсаалт
        </Link>
        <ChevronRight className="size-4 text-muted-foreground/40" />
        <span className="font-medium text-primary">{t('quizSettings')}</span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('quizSettings')}</h1>
        <p className="text-muted-foreground mt-2">{t('quizSettingsDesc')}</p>
      </div>

      {/* Форм */}
      <QuizManagementForm lessonId={lessonId} courseId={courseId} />
    </div>
  );
}
