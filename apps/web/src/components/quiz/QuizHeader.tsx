'use client';

import { BookOpen, Clock, CheckCircle, HelpCircle, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useQuizStore } from '@/stores/quiz-store';
import { QuizTimer } from './QuizTimer';

interface QuizHeaderProps {
  /** Илгээх товч дарагдсан */
  onSubmit: () => void;
  /** Тусламж товч дарагдсан */
  onHelp?: () => void;
}

/**
 * Quiz taking хуудасны дээд header.
 * Лого (зүүн) + таймер/progress pill (голд) + тусламж/илгээх (баруун).
 */
export function QuizHeader({ onSubmit, onHelp }: QuizHeaderProps) {
  const t = useTranslations('quiz');
  const questions = useQuizStore((s) => s.questions);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const hasTimeLimit = useQuizStore((s) => s.hasTimeLimit);
  const isSubmitting = useQuizStore((s) => s.isSubmitting);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-primary/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Лого */}
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">Learnify</h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">
              quiz
            </p>
          </div>
        </div>

        {/* Таймер + Progress (desktop) */}
        <div className="hidden md:flex items-center gap-6 bg-secondary px-6 py-2 rounded-full border border-border">
          {hasTimeLimit && (
            <>
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                <QuizTimer />
              </div>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          <div className="flex items-center gap-2">
            <CheckCircle className="size-5 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">
              {t('questionOf', {
                current: currentQuestionIndex + 1,
                total: questions.length,
              })}
            </span>
          </div>
        </div>

        {/* Баруун талын товчууд */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="font-bold" onClick={onHelp}>
            <HelpCircle className="size-4" />
            <span className="hidden sm:inline">{t('help')}</span>
          </Button>
          <Button size="sm" className="font-bold" onClick={onSubmit} disabled={isSubmitting}>
            <Send className="size-4" />
            <span>{isSubmitting ? t('submitting') : t('submitQuiz')}</span>
          </Button>
        </div>
      </div>

      {/* Мобайл таймер (доод талд fixed) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-foreground/95 backdrop-blur px-6 py-3 rounded-full border border-border shadow-2xl flex items-center gap-4 text-background">
          {hasTimeLimit && (
            <>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <QuizTimer />
              </div>
              <div className="w-px h-4 bg-muted-foreground/30" />
            </>
          )}
          <div className="text-xs font-bold uppercase tracking-tight">
            {currentQuestionIndex + 1} / {questions.length} {t('question')}
          </div>
        </div>
      </div>
    </header>
  );
}
