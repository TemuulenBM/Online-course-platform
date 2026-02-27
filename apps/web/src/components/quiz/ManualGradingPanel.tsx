'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { User, Calendar, FileText, Award, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAttemptDetail, useGradeAttempt } from '@/hooks/api/use-quizzes';
import type { AttemptAnswer, RubricCriterion } from '@/lib/api-services/quizzes.service';

interface ManualGradingPanelProps {
  attemptId: string;
  quizId: string;
}

/**
 * Гараар дүгнэх panel — Essay/Code асуултуудад зориулсан.
 * Оюутны хариулт + Rubric + Оноо + Feedback.
 */
export function ManualGradingPanel({ attemptId, quizId }: ManualGradingPanelProps) {
  const t = useTranslations('quiz');
  const { data: attempt, isLoading } = useAttemptDetail(quizId, attemptId);
  const gradeMutation = useGradeAttempt();

  const [gradingState, setGradingState] = useState<
    Record<string, { points: number; feedback: string }>
  >({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!attempt) return null;

  /** Дүгнэх шаардлагатай (essay/code) хариултууд */
  const gradableAnswers = attempt.answers?.filter((a) => a.isCorrect === null) || [];

  const handleGrade = (answer: AttemptAnswer) => {
    const state = gradingState[answer.questionId];
    if (!state) {
      toast.error('Оноо оруулна уу');
      return;
    }

    gradeMutation.mutate(
      {
        attemptId,
        data: {
          questionId: answer.questionId,
          pointsEarned: state.points,
          isCorrect: state.points > 0,
          feedback: state.feedback || undefined,
        },
      },
      {
        onSuccess: () => toast.success(t('graded')),
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="space-y-8">
      {/* Оюутны мэдээлэл */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{attempt.userId}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {attempt.submittedAt
                  ? new Date(attempt.submittedAt).toLocaleString()
                  : t('pending')}
              </span>
              <Badge variant="secondary">
                {attempt.score ?? 0} / {attempt.maxScore ?? 0}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Дүгнэх хариултууд */}
      {gradableAnswers.length === 0 ? (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <p className="text-muted-foreground">{t('noQuestions')}</p>
        </div>
      ) : (
        gradableAnswers.map((answer) => (
          <div
            key={answer.questionId}
            className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
          >
            {/* Хариултын агуулга */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="uppercase">
                  {t('underReview')}
                </Badge>
              </div>

              {/* Оюутны хариулт */}
              <div>
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  {t('essayContent')}
                </h4>
                <div className="bg-secondary rounded-lg p-4 text-sm leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {answer.answerData?.submittedText || answer.answerData?.submittedCode || '—'}
                </div>
              </div>
            </div>

            {/* Дүгнэлт */}
            <div className="border-t border-border p-6 space-y-4 bg-accent/30">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Award className="size-4 text-primary" />
                {t('gradingTitle')}
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('gradingPoints')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={gradingState[answer.questionId]?.points ?? ''}
                    onChange={(e) =>
                      setGradingState((prev) => ({
                        ...prev,
                        [answer.questionId]: {
                          ...prev[answer.questionId],
                          points: Number(e.target.value),
                          feedback: prev[answer.questionId]?.feedback || '',
                        },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('quickScore')}</Label>
                  <div className="flex gap-2 mt-1">
                    {[0, 5, 8, 10].map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setGradingState((prev) => ({
                            ...prev,
                            [answer.questionId]: {
                              ...prev[answer.questionId],
                              points: s,
                              feedback: prev[answer.questionId]?.feedback || '',
                            },
                          }))
                        }
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  {t('feedback')}
                </Label>
                <Textarea
                  value={gradingState[answer.questionId]?.feedback ?? ''}
                  onChange={(e) =>
                    setGradingState((prev) => ({
                      ...prev,
                      [answer.questionId]: {
                        ...prev[answer.questionId],
                        points: prev[answer.questionId]?.points ?? 0,
                        feedback: e.target.value,
                      },
                    }))
                  }
                  placeholder={t('feedbackPlaceholder')}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button onClick={() => handleGrade(answer)} disabled={gradeMutation.isPending}>
                {gradeMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                {t('grade')}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
