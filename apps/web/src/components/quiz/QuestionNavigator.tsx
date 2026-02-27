'use client';

import { LayoutGrid, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useQuizStore,
  getAnsweredCount,
  getUnansweredCount,
  getQuestionStatus,
} from '@/stores/quiz-store';
import { cn } from '@/lib/utils';

/**
 * Баруун sidebar — асуултын grid навигатор.
 * Хариулсан (ногоон), одоогийн (ягаан ring), тэмдэглэгдсэн (шар), хариулаагүй (dashed).
 */
export function QuestionNavigator() {
  const t = useTranslations('quiz');
  const questions = useQuizStore((s) => s.questions);
  const answers = useQuizStore((s) => s.answers);
  const bookmarkedQuestions = useQuizStore((s) => s.bookmarkedQuestions);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const goToQuestion = useQuizStore((s) => s.goToQuestion);

  const answeredCount = getAnsweredCount(answers);
  const unansweredCount = getUnansweredCount(questions, answers);
  const bookmarkedCount = bookmarkedQuestions.length;

  return (
    <div className="space-y-6">
      {/* Асуултын grid */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
          <LayoutGrid className="size-4" />
          {t('questionNavigator')}
        </h3>

        <div className="grid grid-cols-5 gap-3">
          {questions.map((q, index) => {
            const status = getQuestionStatus(
              q.questionId,
              answers,
              bookmarkedQuestions,
              currentQuestionIndex,
              questions,
            );

            return (
              <button
                key={q.questionId}
                onClick={() => goToQuestion(index)}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-lg font-bold text-sm cursor-pointer transition-all hover:scale-105',
                  status === 'answered' && 'bg-emerald-500 text-white shadow-sm',
                  status === 'current' &&
                    'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg shadow-primary/30',
                  status === 'bookmarked' && 'bg-amber-400 text-white shadow-sm',
                  status === 'unanswered' &&
                    'bg-secondary border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-accent',
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 space-y-3 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground">
              {t('answered')} ({answeredCount})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              {t('currentQuestion')}
            </span>
          </div>
          {bookmarkedCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">
                {t('bookmarked')} ({bookmarkedCount})
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-secondary border border-dashed border-muted-foreground/30" />
            <span className="text-xs font-medium text-muted-foreground">
              {t('unanswered')} ({unansweredCount})
            </span>
          </div>
        </div>
      </div>

      {/* Зөвлөгөө */}
      <div className="bg-primary/10 rounded-xl p-6 border border-primary/20 relative overflow-hidden group">
        <div className="relative z-10">
          <h4 className="text-primary font-bold mb-2">{t('tip')}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{t('tipText')}</p>
        </div>
        <Lightbulb className="absolute -bottom-4 -right-4 size-20 text-primary/10 group-hover:scale-110 transition-transform" />
      </div>
    </div>
  );
}
