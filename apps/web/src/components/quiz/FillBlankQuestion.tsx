'use client';

import { useTranslations } from 'next-intl';
import type { AnswerData } from '@/lib/api-services/quizzes.service';

interface FillBlankQuestionProps {
  answer?: AnswerData;
  onAnswer: (data: AnswerData) => void;
}

/**
 * Нөхөж бичих асуулт — Текст оруулах input талбар.
 */
export function FillBlankQuestion({ answer, onAnswer }: FillBlankQuestionProps) {
  const t = useTranslations('quiz');
  const value = answer?.filledAnswer || '';

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onAnswer({ filledAnswer: e.target.value })}
        placeholder={t('fillBlankPlaceholder')}
        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-secondary/50 text-foreground font-medium placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg"
      />
      <div className="text-right">
        <span className="text-xs text-muted-foreground">{value.length} / 200</span>
      </div>
    </div>
  );
}
