'use client';

import { CheckCircle, XCircle, Check, X, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { AttemptAnswer } from '@/lib/api-services/quizzes.service';

interface QuestionBreakdownItem {
  questionId: string;
  questionText: string;
  type: string;
  points: number;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  answerData?: {
    selectedOption?: string;
    selectedAnswer?: boolean;
    filledAnswer?: string;
    submittedCode?: string;
    submittedText?: string;
  };
  /** Зөв хариулт (multiple_choice-д option text) */
  correctAnswerText?: string;
  /** Таны хариултын текст */
  yourAnswerText?: string;
  explanation?: string;
  timeSpentSeconds?: number;
}

interface QuizResultsBreakdownProps {
  questions: QuestionBreakdownItem[];
}

/**
 * Асуулт тус бүрийн дүнгийн дэлгэрэнгүй — зөв/буруу, хариулт, тайлбар, зарцуулсан хугацаа.
 */
export function QuizResultsBreakdown({ questions }: QuizResultsBreakdownProps) {
  const t = useTranslations('quiz');

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-foreground text-xl font-bold">{t('questionsBreakdown')}</h2>
      </div>

      <div className="divide-y divide-border">
        {questions.map((q, index) => {
          const isCorrect = q.isCorrect === true;
          const isWrong = q.isCorrect === false;
          const isPending = q.isCorrect === null;

          return (
            <motion.div
              key={q.questionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="flex flex-col md:flex-row gap-4 p-6 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div
                  className={cn(
                    'flex items-center justify-center rounded-lg shrink-0 size-12 shadow-sm',
                    isCorrect &&
                      'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                    isWrong && 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
                    isPending &&
                      'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
                  )}
                >
                  {isCorrect && <CheckCircle className="size-6" />}
                  {isWrong && <XCircle className="size-6" />}
                  {isPending && <AlertCircle className="size-6" />}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs font-bold uppercase tracking-widest',
                        isCorrect && 'text-emerald-600 dark:text-emerald-400',
                        isWrong && 'text-red-600 dark:text-red-400',
                        isPending && 'text-amber-600 dark:text-amber-400',
                      )}
                    >
                      {isCorrect ? t('correct') : isWrong ? t('wrong') : t('pending')}
                    </span>
                    <p className="text-foreground text-base font-semibold leading-normal">
                      {index + 1}. {q.questionText}
                    </p>
                  </div>

                  <div
                    className={cn(
                      'flex flex-col gap-1 pl-3 ml-1 border-l-2',
                      isCorrect && 'border-emerald-200 dark:border-emerald-800',
                      isWrong && 'border-red-200 dark:border-red-800',
                      isPending && 'border-amber-200 dark:border-amber-800',
                    )}
                  >
                    {/* Таны хариулт */}
                    {q.yourAnswerText && (
                      <p className="text-muted-foreground text-sm font-medium flex items-center gap-1">
                        {isCorrect ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : isWrong ? (
                          <X className="size-3.5 text-red-500" />
                        ) : null}
                        {t('yourAnswer')}: {q.yourAnswerText}
                      </p>
                    )}

                    {/* Зөв хариулт (буруу бол харуулна) */}
                    {isWrong && q.correctAnswerText && (
                      <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                        {t('correctAnswerLabel')}: {q.correctAnswerText}
                      </p>
                    )}

                    {/* Тайлбар */}
                    {q.explanation && (
                      <p className="text-muted-foreground text-sm italic">
                        {t('explanation')}: {q.explanation}
                      </p>
                    )}

                    {/* Зарцуулсан хугацаа */}
                    {q.timeSpentSeconds != null && q.timeSpentSeconds > 0 && (
                      <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                        <Clock className="size-3" />
                        {t('timePerQuestion')}: {q.timeSpentSeconds} {t('seconds')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Оноо */}
              <div className="shrink-0 pt-1">
                <p
                  className={cn(
                    'text-sm font-bold px-3 py-1 rounded-full border',
                    isCorrect &&
                      'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-800',
                    isWrong &&
                      'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-800',
                    isPending &&
                      'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-800',
                  )}
                >
                  {t('pointsEarned', {
                    earned: q.pointsEarned ?? 0,
                    total: q.points,
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
