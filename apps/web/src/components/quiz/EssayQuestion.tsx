'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { AnswerData } from '@/lib/api-services/quizzes.service';

interface EssayQuestionProps {
  answer?: AnswerData;
  onAnswer: (data: AnswerData) => void;
  minWords?: number;
  maxWords?: number;
}

/**
 * Эссэ асуулт — Textarea + үгийн тоо.
 */
export function EssayQuestion({ answer, onAnswer, minWords, maxWords }: EssayQuestionProps) {
  const t = useTranslations('quiz');
  const value = answer?.submittedText || '';

  /** Үгийн тоо */
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  /** Min/max шаардлага биелсэн эсэх */
  const isBelowMin = minWords ? wordCount < minWords : false;
  const isAboveMax = maxWords ? wordCount > maxWords : false;

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onAnswer({ submittedText: e.target.value })}
        placeholder={t('essayPlaceholder')}
        rows={10}
        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex gap-3">
          {minWords && (
            <span className={cn(isBelowMin && 'text-amber-500 font-medium')}>
              {t('minWords', { min: minWords })}
            </span>
          )}
        </div>
        <span className={cn(isAboveMax && 'text-red-500 font-medium')}>
          {t('wordCount', { count: wordCount })}
          {maxWords && ` / ${maxWords}`}
        </span>
      </div>
    </div>
  );
}
