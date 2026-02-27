'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer';
import { QuestionNavigator } from '@/components/quiz/QuestionNavigator';
import { SubmitConfirmDialog } from '@/components/quiz/SubmitConfirmDialog';
import { useQuizStore } from '@/stores/quiz-store';
import { useQuizById, useStartAttempt, useSubmitAttempt } from '@/hooks/api/use-quizzes';
import { ROUTES } from '@/lib/constants';
import type { SubmitAttemptData } from '@/lib/api-services/quizzes.service';

/**
 * Quiz Taking хуудас — Бүтэн дэлгэцийн quiz өгөх туршлага.
 * Sidebar-гүй, QuizHeader + QuestionRenderer + QuestionNavigator.
 */
export default function QuizTakePage() {
  const params = useParams<{ quizId: string }>();
  const router = useRouter();
  const t = useTranslations('quiz');
  const quizId = params.quizId;

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  /** Zustand store actions */
  const initAttempt = useQuizStore((s) => s.initAttempt);
  const clearAttempt = useQuizStore((s) => s.clearAttempt);
  const setSubmitting = useQuizStore((s) => s.setSubmitting);
  const storeQuizId = useQuizStore((s) => s.quizId);
  const storeAttemptId = useQuizStore((s) => s.attemptId);
  const questions = useQuizStore((s) => s.questions);
  const answers = useQuizStore((s) => s.answers);
  const questionTimeSpent = useQuizStore((s) => s.questionTimeSpent);
  const timeRemaining = useQuizStore((s) => s.timeRemainingSeconds);
  const hasTimeLimit = useQuizStore((s) => s.hasTimeLimit);
  const isHydrated = useQuizStore((s) => s.isHydrated);

  /** Quiz мэдээлэл авах */
  const { data: quiz } = useQuizById(quizId);

  /** Оролдлого эхлүүлэх mutation */
  const startMutation = useStartAttempt();

  /** Хариулт илгээх mutation */
  const submitMutation = useSubmitAttempt();

  /** Auto-submit reference (давхар дуудагдахаас хамгаалах) */
  const hasAutoSubmittedRef = useRef(false);

  /** Оролдлого эхлүүлэх / бэлэн оролдлого сэргээх */
  useEffect(() => {
    if (!isHydrated || !quiz) return;

    /** Хэрэв store-д хадгалагдсан оролдлого байвал (refresh хийсэн тохиолдол) сэргээнэ */
    if (storeQuizId === quizId && storeAttemptId && questions.length > 0) {
      return;
    }

    /** Шинэ оролдлого эхлүүлэх */
    startMutation.mutate(quizId, {
      onSuccess: (data) => {
        const timeLimitSeconds = quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : null;
        initAttempt(quizId, data.attempt.id, data.questions, timeLimitSeconds);
      },
      onError: (error: Error) => {
        toast.error(error.message || t('error'));
        router.back();
      },
    });
  }, [isHydrated, quiz, quizId]);

  /** Хугацаа дуусахад автомат илгээх */
  useEffect(() => {
    if (hasTimeLimit && timeRemaining <= 0 && storeAttemptId && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      toast.info(t('timeUp'));
      handleSubmitConfirm();
    }
  }, [timeRemaining, hasTimeLimit, storeAttemptId]);

  /** Хариулт илгээх */
  const handleSubmitConfirm = useCallback(() => {
    if (!storeAttemptId) return;

    setSubmitting(true);

    /** SubmitAttemptData бэлтгэх */
    const submitData: SubmitAttemptData = {
      answers: Object.entries(answers).map(([questionId, answerData]) => ({
        questionId,
        answerData,
        timeSpentSeconds: questionTimeSpent[questionId] || 0,
      })),
    };

    submitMutation.mutate(
      { quizId, attemptId: storeAttemptId, data: submitData },
      {
        onSuccess: () => {
          clearAttempt();
          router.replace(ROUTES.QUIZ_RESULTS(quizId, storeAttemptId));
        },
        onError: (error: Error) => {
          toast.error(error.message || t('error'));
          setSubmitting(false);
        },
      },
    );
  }, [
    storeAttemptId,
    quizId,
    answers,
    questionTimeSpent,
    submitMutation,
    clearAttempt,
    router,
    setSubmitting,
    t,
  ]);

  /** Store hydrated болтол loading харуулах */
  if (!isHydrated || (!storeAttemptId && startMutation.isPending)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">{t('submitting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <QuizHeader onSubmit={() => setShowSubmitDialog(true)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Зүүн тал: Асуулт */}
          <div className="lg:col-span-8">
            <QuestionRenderer />
          </div>

          {/* Баруун тал: Навигатор */}
          <div className="lg:col-span-4">
            <QuestionNavigator />
          </div>
        </div>
      </main>

      {/* Илгээхийн баталгаажуулалт */}
      <SubmitConfirmDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onConfirm={handleSubmitConfirm}
      />
    </div>
  );
}
