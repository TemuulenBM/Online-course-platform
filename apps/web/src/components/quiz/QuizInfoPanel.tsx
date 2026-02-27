'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Info,
  Timer,
  ShieldCheck,
  HelpCircle,
  Award,
  RotateCcw,
  Play,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuizByLessonId, useMyAttempts, useStartAttempt } from '@/hooks/api/use-quizzes';
import { QuizAttemptHistory } from './QuizAttemptHistory';
import { ROUTES } from '@/lib/constants';
import type { Quiz } from '@/lib/api-services/quizzes.service';

interface QuizInfoPanelProps {
  lessonId: string;
}

/**
 * Lesson viewer-д харагдах Quiz мэдээллийн panel.
 * Quiz тохиргоо, өмнөх оролдлогууд, "Quiz эхлэх" товч.
 */
export function QuizInfoPanel({ lessonId }: QuizInfoPanelProps) {
  const t = useTranslations('quiz');
  const router = useRouter();

  const { data: quiz, isLoading: quizLoading } = useQuizByLessonId(lessonId);
  const { data: attempts, isLoading: attemptsLoading } = useMyAttempts(quiz?.id || '');

  /** Quiz эхлэх боломжтой эсэх */
  const maxAttempts = quiz?.maxAttempts;
  const usedAttempts = attempts?.length || 0;
  const remainingAttempts = maxAttempts ? maxAttempts - usedAttempts : null;
  const canStartQuiz = remainingAttempts === null || remainingAttempts > 0;

  if (quizLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <HelpCircle className="size-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground">{t('noQuiz')}</p>
      </div>
    );
  }

  const handleStartQuiz = () => {
    router.push(ROUTES.QUIZ_TAKE(quiz.id));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">{quiz.title}</h2>
        {quiz.description && (
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {quiz.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Зүүн тал: Quiz мэдээлэл + Attempts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Шалгалтын мэдээлэл */}
          <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Info className="size-5 text-primary" />
              {t('quizDetails')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {quiz.timeLimitMinutes && (
                <InfoBox
                  label={t('duration')}
                  icon={<Timer className="size-5 text-primary" />}
                  value={`${quiz.timeLimitMinutes} ${t('minutes')}`}
                />
              )}
              <InfoBox
                label={t('passingThreshold')}
                icon={<ShieldCheck className="size-5 text-primary" />}
                value={`${quiz.passingScorePercentage}%`}
              />
              {quiz.totalQuestions != null && (
                <InfoBox
                  label={t('totalQuestions')}
                  icon={<HelpCircle className="size-5 text-primary" />}
                  value={`${quiz.totalQuestions} ${t('question')}`}
                />
              )}
              {quiz.totalPoints != null && (
                <InfoBox
                  label={t('totalPoints')}
                  icon={<Award className="size-5 text-primary" />}
                  value={`${quiz.totalPoints} ${t('points')}`}
                />
              )}
              {maxAttempts && (
                <InfoBox
                  label={t('attempts')}
                  icon={<RotateCcw className="size-5 text-primary" />}
                  value={`${maxAttempts} ${t('attempts').toLowerCase()}`}
                />
              )}
            </div>
          </div>

          {/* Өмнөх оролдлогууд */}
          <QuizAttemptHistory
            attempts={attempts || []}
            isLoading={attemptsLoading}
            quizId={quiz.id}
            remainingAttempts={remainingAttempts}
            passingPercentage={quiz.passingScorePercentage}
          />
        </div>

        {/* Баруун тал: Quiz эхлүүлэх + зааварчилгаа */}
        <div className="lg:col-span-1 space-y-6">
          {/* CTA карт */}
          <div className="bg-primary rounded-xl p-8 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-4">{t('ready')}</h4>
              <p className="text-sm mb-6 leading-relaxed opacity-90">{t('readyDesc')}</p>
              <Button
                className="w-full py-6 bg-white text-primary rounded-xl font-black text-lg hover:bg-white/90 shadow-lg"
                onClick={handleStartQuiz}
                disabled={!canStartQuiz}
              >
                <Play className="size-5" />
                {t('startQuiz')}
              </Button>
              {maxAttempts && (
                <p className="text-xs text-center mt-4 opacity-70">
                  {canStartQuiz
                    ? t('attemptsRemaining', { count: remainingAttempts ?? 0 })
                    : t('noAttemptsRemaining')}
                </p>
              )}
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Зааварчилгаа */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h4 className="font-bold text-foreground mb-4">{t('instructions')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle className="size-5 text-primary shrink-0 mt-0.5" />
                {t('instruction1')}
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle className="size-5 text-primary shrink-0 mt-0.5" />
                {t('instruction2')}
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle className="size-5 text-primary shrink-0 mt-0.5" />
                {t('instruction3')}
              </li>
            </ul>
          </div>

          {/* Тусламж */}
          <div className="p-6 bg-primary/5 rounded-xl border border-primary/10">
            <h4 className="font-bold text-foreground mb-2">{t('needHelp')}</h4>
            <p className="text-xs text-muted-foreground mb-4">{t('helpLink').replace(' →', '')}</p>
            <a
              className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
              href="#"
            >
              {t('helpLink')}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Мэдээллийн жижиг box */
function InfoBox({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
  return (
    <div className="p-4 bg-secondary rounded-xl">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
    </div>
  );
}
