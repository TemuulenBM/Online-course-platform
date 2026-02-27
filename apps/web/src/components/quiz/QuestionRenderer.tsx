'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useQuizStore } from '@/stores/quiz-store';
import { cn } from '@/lib/utils';
import type { AnswerData, Question } from '@/lib/api-services/quizzes.service';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { FillBlankQuestion } from './FillBlankQuestion';
import { EssayQuestion } from './EssayQuestion';
import { CodeChallengeQuestion } from './CodeChallengeQuestion';

/**
 * Асуултын төрлөөр тохирох component render хийгч.
 * framer-motion slide animation ашиглан асуулт хооронд шилжинэ.
 * Мөн bookmark товч, progress bar, prev/next товчуудыг агуулна.
 */
export function QuestionRenderer() {
  const t = useTranslations('quiz');
  const questions = useQuizStore((s) => s.questions);
  const answers = useQuizStore((s) => s.answers);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const bookmarkedQuestions = useQuizStore((s) => s.bookmarkedQuestions);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const toggleBookmark = useQuizStore((s) => s.toggleBookmark);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const prevQuestion = useQuizStore((s) => s.prevQuestion);
  const addQuestionTime = useQuizStore((s) => s.addQuestionTime);

  const question = questions[currentQuestionIndex];
  if (!question) return null;

  const isBookmarked = bookmarkedQuestions.includes(question.questionId);
  const currentAnswer = answers[question.questionId];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  /** Тухайн асуултын хугацааг бүртгэх (секунд тутамд) */
  const timeTrackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevQuestionIdRef = useRef<string>(question.questionId);

  useEffect(() => {
    /** Асуулт солигдоход хуучин timer-г цэвэрлэх */
    if (timeTrackRef.current) clearInterval(timeTrackRef.current);

    prevQuestionIdRef.current = question.questionId;

    timeTrackRef.current = setInterval(() => {
      addQuestionTime(prevQuestionIdRef.current, 1);
    }, 1000);

    return () => {
      if (timeTrackRef.current) clearInterval(timeTrackRef.current);
    };
  }, [question.questionId, addQuestionTime]);

  /** Keyboard navigation */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextQuestion();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextQuestion, prevQuestion]);

  const handleAnswer = useCallback(
    (data: AnswerData) => {
      setAnswer(question.questionId, data);
    },
    [question.questionId, setAnswer],
  );

  /** Асуултын төрлөөр тохирох component */
  const renderQuestion = (q: Question) => {
    switch (q.type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            options={q.options || []}
            answer={currentAnswer}
            onAnswer={handleAnswer}
          />
        );
      case 'true_false':
        return <TrueFalseQuestion answer={currentAnswer} onAnswer={handleAnswer} />;
      case 'fill_blank':
        return <FillBlankQuestion answer={currentAnswer} onAnswer={handleAnswer} />;
      case 'essay':
        return (
          <EssayQuestion
            answer={currentAnswer}
            onAnswer={handleAnswer}
            minWords={q.minWords}
            maxWords={q.maxWords}
          />
        );
      case 'code_challenge':
        return (
          <CodeChallengeQuestion
            answer={currentAnswer}
            onAnswer={handleAnswer}
            language={q.language}
            starterCode={q.starterCode}
          />
        );
      default:
        return <div className="text-muted-foreground">Unknown question type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Асуулт карт */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        {/* Badge + Points + Bookmark */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {t('questionLabel', { number: currentQuestionIndex + 1 })}
            </span>
            {/* Bookmark товч */}
            <button
              onClick={() => toggleBookmark(question.questionId)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isBookmarked
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                  : 'text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10',
              )}
              title={isBookmarked ? t('unbookmark') : t('bookmark')}
            >
              <Bookmark className={cn('size-4', isBookmarked && 'fill-current')} />
            </button>
          </div>
          <div className="text-right">
            <p className="text-primary font-bold text-lg leading-none">{question.points}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
              {t('points')}
            </p>
          </div>
        </div>

        {/* Асуултын текст */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          {question.questionText}
        </h2>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2 mb-8 overflow-hidden">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Асуултын төрлийн component */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.questionId}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderQuestion(question)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Өмнөх / Дараах товчууд */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="font-bold shadow-sm"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="size-4" />
          {t('previous')}
        </Button>
        <Button
          className="font-bold shadow-md bg-foreground text-background hover:bg-foreground/90"
          onClick={nextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          {t('next')}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
