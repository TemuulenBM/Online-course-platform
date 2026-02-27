'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, Download, RefreshCw, CheckCircle, BarChart3, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStudentAttempts } from '@/hooks/api/use-quizzes';
import type { QuizAttempt, StudentAttemptsParams } from '@/lib/api-services/quizzes.service';

interface StudentAttemptsTableProps {
  quizId: string;
  courseId: string;
  lessonId: string;
}

/**
 * Оюутнуудын оролдлогын хүснэгт + filter + pagination + статистик карт.
 * Багш/Админ хуудсанд ашиглагдана.
 */
export function StudentAttemptsTable({ quizId, courseId, lessonId }: StudentAttemptsTableProps) {
  const t = useTranslations('quiz');
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const params: StudentAttemptsParams = { page, limit: 10, status };
  const { data, isLoading, refetch } = useStudentAttempts(quizId, params);

  const attempts =
    (data as unknown as { items?: QuizAttempt[]; data?: QuizAttempt[] })?.items ||
    (data as unknown as { items?: QuizAttempt[]; data?: QuizAttempt[] })?.data ||
    [];
  const total = (data as unknown as { total?: number })?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      {/* Filter + Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium"
            value={status || ''}
            onChange={(e) => {
              setStatus(e.target.value || undefined);
              setPage(1);
            }}
          >
            <option value="">{t('filterByStatus')}</option>
            <option value="passed">{t('passed')}</option>
            <option value="failed">{t('failed')}</option>
            <option value="pending">{t('pending')}</option>
          </select>
          <span className="text-sm text-muted-foreground">
            {t('totalParticipants', { count: total })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="size-4" />
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Хүснэгт */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('studentName')}
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
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('dateTime')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.map((attempt) => {
                  const isPassed = attempt.passed === true;
                  const isPending = attempt.passed === null;

                  return (
                    <tr key={attempt.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {attempt.userId?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm font-medium truncate">{attempt.userId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {attempt.score ?? '-'} / {attempt.maxScore ?? '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-secondary h-2 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                isPassed
                                  ? 'bg-emerald-500'
                                  : isPending
                                    ? 'bg-amber-500'
                                    : 'bg-red-500',
                              )}
                              style={{ width: `${attempt.scorePercentage ?? 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {attempt.scorePercentage ?? 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={cn(
                            'font-bold',
                            isPassed
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                              : isPending
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
                          )}
                          variant="secondary"
                        >
                          {isPassed ? t('passed') : isPending ? t('pending') : t('failed')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString()
                          : new Date(attempt.startedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            router.push(
                              `/teacher/courses/${courseId}/lessons/${lessonId}/quiz/attempts/${attempt.id}`,
                            )
                          }
                        >
                          <Eye className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {attempts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      {t('noAttempts')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('showingRange', {
                from: (page - 1) * 10 + 1,
                to: Math.min(page * 10, total),
                total,
              })}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                &lt;
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="icon-xs"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon-xs"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                &gt;
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Статистик картууд */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<CheckCircle className="size-8 text-emerald-500" />}
          label={t('avgScore')}
          value="—"
        />
        <StatCard
          icon={<BarChart3 className="size-8 text-primary" />}
          label={t('passRate')}
          value="—"
        />
        <StatCard
          icon={<Clock className="size-8 text-amber-500" />}
          label={t('avgTime')}
          value="—"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm flex items-center gap-4">
      {icon}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
