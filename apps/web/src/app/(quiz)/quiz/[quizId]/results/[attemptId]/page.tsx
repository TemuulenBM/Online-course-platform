'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, RotateCcw, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizResultsSummary } from '@/components/quiz/QuizResultsSummary';
import { QuizResultsBreakdown } from '@/components/quiz/QuizResultsBreakdown';
import { useAttemptDetail, useQuizById } from '@/hooks/api/use-quizzes';
import { ROUTES } from '@/lib/constants';

/**
 * Quiz Results хуудас — Дүнгийн нэгтгэл + асуулт тус бүрийн дэлгэрэнгүй.
 */
export default function QuizResultsPage() {
  const params = useParams<{ quizId: string; attemptId: string }>();
  const router = useRouter();
  const t = useTranslations('quiz');
  const { quizId, attemptId } = params;

  const { data: attempt, isLoading: attemptLoading } = useAttemptDetail(quizId, attemptId);
  const { data: quiz, isLoading: quizLoading } = useQuizById(quizId);

  if (attemptLoading || quizLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!attempt || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t('noData')}</p>
      </div>
    );
  }

  const scorePercentage = attempt.scorePercentage ?? 0;
  const passed = attempt.passed ?? false;

  /** Асуултуудын breakdown мэдээлэл бэлтгэх */
  const breakdownQuestions = (quiz.questions || []).map((q) => {
    const answer = attempt.answers?.find((a) => a.questionId === q.questionId);

    /** Таны хариултын текст */
    let yourAnswerText = '';
    if (answer?.answerData) {
      if (q.type === 'multiple_choice' && answer.answerData.selectedOption) {
        const selectedOpt = q.options?.find((o) => o.optionId === answer.answerData.selectedOption);
        yourAnswerText = selectedOpt?.text || '';
      } else if (q.type === 'true_false' && answer.answerData.selectedAnswer != null) {
        yourAnswerText = answer.answerData.selectedAnswer ? t('trueOption') : t('falseOption');
      } else if (q.type === 'fill_blank') {
        yourAnswerText = answer.answerData.filledAnswer || '';
      } else if (q.type === 'essay') {
        yourAnswerText = answer.answerData.submittedText
          ? `${answer.answerData.submittedText.slice(0, 100)}...`
          : '';
      } else if (q.type === 'code_challenge') {
        yourAnswerText = answer.answerData.submittedCode
          ? `${answer.answerData.submittedCode.slice(0, 100)}...`
          : '';
      }
    }

    /** Зөв хариултын текст */
    let correctAnswerText = '';
    if (q.type === 'multiple_choice') {
      const correctOpt = q.options?.find((o) => o.isCorrect);
      correctAnswerText = correctOpt?.text || '';
    } else if (q.type === 'true_false') {
      correctAnswerText = q.correctAnswer ? t('trueOption') : t('falseOption');
    } else if (q.type === 'fill_blank' && q.correctAnswers) {
      correctAnswerText = q.correctAnswers.join(', ');
    }

    return {
      questionId: q.questionId,
      questionText: q.questionText,
      type: q.type,
      points: q.points,
      isCorrect: answer?.isCorrect ?? null,
      pointsEarned: answer?.pointsEarned ?? null,
      yourAnswerText,
      correctAnswerText,
      explanation: q.explanation,
      timeSpentSeconds: answer?.timeSpentSeconds,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-10 py-3 sticky top-0 z-50">
        <div className="max-w-[960px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-primary-foreground">
              <Download className="size-4" />
            </div>
            <h2 className="text-foreground text-lg font-bold">Learnify</h2>
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center py-10 px-4 md:px-20 lg:px-40">
        <div className="flex flex-col max-w-[960px] flex-1">
          {/* Гарчиг + товчууд */}
          <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-foreground text-4xl font-black leading-tight tracking-tight">
                {t('results')}
              </h1>
              <p className="text-muted-foreground text-lg">
                {passed ? t('resultsSubtitlePassed') : t('resultsSubtitleFailed')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="size-4" />
                {t('goBack')}
              </Button>
              <Button onClick={() => router.push(ROUTES.QUIZ_TAKE(quizId))}>
                <RotateCcw className="size-4" />
                {t('retryQuiz')}
              </Button>
            </div>
          </div>

          {/* 3 карт нэгтгэл */}
          <QuizResultsSummary
            score={attempt.score ?? 0}
            maxScore={attempt.maxScore ?? 0}
            passed={passed}
            scorePercentage={scorePercentage}
          />

          {/* Асуулт тус бүрийн дүн */}
          <QuizResultsBreakdown questions={breakdownQuestions} />

          {/* Сертификат */}
          {passed && (
            <div className="mt-6 p-6 bg-accent/50 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">{t('certificateEligible')}</p>
              <Button
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Download className="size-4" />
                {t('downloadCertificate')}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 px-10 text-center">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
          &copy; 2024 Learnify Education Platform
        </p>
      </footer>
    </div>
  );
}
