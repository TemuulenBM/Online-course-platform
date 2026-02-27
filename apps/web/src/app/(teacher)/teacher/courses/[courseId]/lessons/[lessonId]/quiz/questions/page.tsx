'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ChevronRight, Plus, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionListItem } from '@/components/quiz/QuestionListItem';
import { QuestionEditor } from '@/components/quiz/QuestionEditor';
import { useQuizByLessonId, useDeleteQuestion } from '@/hooks/api/use-quizzes';
import type { Question } from '@/lib/api-services/quizzes.service';

/**
 * Асуултын удирдлага хуудас — Багш/Админ.
 * Зүүн тал: жагсаалт, Баруун тал: editor sidebar.
 */
export default function QuestionManagementPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const t = useTranslations('quiz');

  const { data: quiz, isLoading } = useQuizByLessonId(lessonId);
  const deleteMutation = useDeleteQuestion();

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const questions = (quiz as unknown as { questions?: Question[] })?.questions || [];

  const handleDelete = (questionId: string) => {
    if (!quiz || !confirm(t('deleteQuestion') + '?')) return;
    deleteMutation.mutate(
      { quizId: quiz.id, questionId },
      {
        onSuccess: () => toast.success(t('questionDeleted')),
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  const handleCloseEditor = () => {
    setSelectedQuestion(null);
    setIsAddingNew(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <span className="font-medium text-primary">{t('questionManagement')}</span>
      </nav>

      {/* Title + Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            {t('questionManagement')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('questionManagementDesc')}</p>
        </div>
        <Button
          onClick={() => {
            setSelectedQuestion(null);
            setIsAddingNew(true);
          }}
        >
          <Plus className="size-4" />
          {t('addQuestion')}
        </Button>
      </div>

      {/* 2 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Зүүн: Жагсаалт */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <List className="size-4" />
            {t('questionList')}
          </h3>

          {questions.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
              {t('noQuestions')}
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <QuestionListItem
                  key={q.questionId}
                  question={q}
                  isSelected={selectedQuestion?.questionId === q.questionId}
                  onSelect={() => {
                    setSelectedQuestion(q);
                    setIsAddingNew(false);
                  }}
                  onDelete={() => handleDelete(q.questionId)}
                />
              ))}
            </div>
          )}

          {/* Шинэ асуулт нэмэх placeholder */}
          <button
            onClick={() => {
              setSelectedQuestion(null);
              setIsAddingNew(true);
            }}
            className="w-full border-2 border-dashed border-primary/30 rounded-xl p-4 text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
          >
            <Plus className="size-4" />
            {t('addNewQuestion')}
          </button>
        </div>

        {/* Баруун: Editor */}
        <div>
          {(selectedQuestion || isAddingNew) && quiz && (
            <QuestionEditor
              quizId={quiz.id}
              question={selectedQuestion}
              onClose={handleCloseEditor}
            />
          )}
        </div>
      </div>
    </div>
  );
}
