'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { History, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { QuizAttempt } from '@/lib/api-services/quizzes.service';

interface QuizAttemptHistoryProps {
  attempts: QuizAttempt[];
  isLoading: boolean;
  quizId: string;
  remainingAttempts: number | null;
  passingPercentage: number;
}

/**
 * Өмнөх оролдлогуудын хүснэгт — quiz info panel дотор.
 */
export function QuizAttemptHistory({
  attempts,
  isLoading,
  quizId,
  remainingAttempts,
  passingPercentage,
}: QuizAttemptHistoryProps) {
  const t = useTranslations('quiz');
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-secondary rounded" />
          <div className="h-16 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <History className="size-5 text-primary" />
          {t('previousAttempts')}
        </h3>
        {remainingAttempts !== null && (
          <span className="text-sm font-medium text-muted-foreground">
            {t('attemptsRemaining', { count: remainingAttempts })}
          </span>
        )}
      </div>

      {attempts.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground text-sm">{t('noAttempts')}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('attempts')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('score')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('percentageCol')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    {t('dateTime')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.map((attempt, index) => {
                  const isPassed = attempt.passed === true;
                  const isInProgress = attempt.isInProgress;

                  return (
                    <tr key={attempt.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {isInProgress ? '-' : `${attempt.score ?? 0} / ${attempt.maxScore ?? 0}`}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {isInProgress ? '-' : `${attempt.scorePercentage ?? 0}%`}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-3 py-1 text-xs font-bold rounded-full',
                            isPassed
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                              : isInProgress
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
                          )}
                        >
                          {isPassed ? t('passed') : isInProgress ? t('pending') : t('failed')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground text-right">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleDateString()
                          : new Date(attempt.startedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isInProgress && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => router.push(ROUTES.QUIZ_RESULTS(quizId, attempt.id))}
                          >
                            <Eye className="size-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Доод мэдээлэл */}
          {attempts.length > 0 && (
            <div className="p-4 bg-primary/5 text-center">
              <p className="text-sm text-primary font-medium">
                {t('totalParticipants', { count: attempts.length })}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
