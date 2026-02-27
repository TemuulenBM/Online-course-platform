'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, AlertCircle, Bookmark, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useQuizStore, getAnsweredCount, getUnansweredCount } from '@/stores/quiz-store';
import { cn } from '@/lib/utils';

interface SubmitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Шалгалт илгээхийн өмнөх баталгаажуулалт dialog.
 * Хариулсан/хариулаагүй тоо + Quick Review жагсаалт.
 */
export function SubmitConfirmDialog({ open, onOpenChange, onConfirm }: SubmitConfirmDialogProps) {
  const t = useTranslations('quiz');
  const questions = useQuizStore((s) => s.questions);
  const answers = useQuizStore((s) => s.answers);
  const bookmarkedQuestions = useQuizStore((s) => s.bookmarkedQuestions);
  const goToQuestion = useQuizStore((s) => s.goToQuestion);
  const isSubmitting = useQuizStore((s) => s.isSubmitting);

  const answeredCount = getAnsweredCount(answers);
  const unansweredCount = getUnansweredCount(questions, answers);

  /** Quick Review дэх асуулт дарагдсан */
  const handleGoToQuestion = (index: number) => {
    goToQuestion(index);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            {t('confirmSubmit')}
          </DialogTitle>
          <DialogDescription>{t('confirmSubmitDesc')}</DialogDescription>
        </DialogHeader>

        {/* Статистик */}
        <div className="grid grid-cols-2 gap-3 py-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle className="size-5 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {answeredCount}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">{t('answered')}</p>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              unansweredCount > 0
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                : 'bg-secondary border-border',
            )}
          >
            <AlertCircle
              className={cn(
                'size-5',
                unansweredCount > 0 ? 'text-amber-500' : 'text-muted-foreground',
              )}
            />
            <div>
              <p
                className={cn(
                  'text-sm font-bold',
                  unansweredCount > 0
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-muted-foreground',
                )}
              >
                {unansweredCount}
              </p>
              <p
                className={cn(
                  'text-xs',
                  unansweredCount > 0
                    ? 'text-amber-600 dark:text-amber-500'
                    : 'text-muted-foreground',
                )}
              >
                {t('unanswered')}
              </p>
            </div>
          </div>
        </div>

        {/* Анхааруулга */}
        {unansweredCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <AlertCircle className="size-4 text-amber-500 shrink-0" />
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {t('unansweredWarning', { count: unansweredCount })}
            </p>
          </div>
        )}

        {/* Quick Review */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-muted-foreground">{t('reviewAnswers')}</h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {questions.map((q, index) => {
              const isAnswered = !!answers[q.questionId];
              const isBookmarked = bookmarkedQuestions.includes(q.questionId);

              return (
                <button
                  key={q.questionId}
                  onClick={() => handleGoToQuestion(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors hover:bg-accent',
                    isBookmarked && 'bg-amber-50 dark:bg-amber-500/5',
                  )}
                >
                  <span
                    className={cn(
                      'size-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0',
                      isAnswered
                        ? 'bg-emerald-500 text-white'
                        : 'bg-secondary text-muted-foreground border border-dashed border-muted-foreground/30',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate text-muted-foreground flex-1">{q.questionText}</span>
                  {isBookmarked && (
                    <Bookmark className="size-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  )}
                  {isAnswered ? (
                    <CheckCircle className="size-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="size-4 rounded-full border-2 border-dashed border-muted-foreground/30 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('goBack')}
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            <Send className="size-4" />
            {isSubmitting ? t('submitting') : t('submitQuiz')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
