'use client';

import { useTranslations } from 'next-intl';
import type { AnswerData } from '@/lib/api-services/quizzes.service';

interface CodeChallengeQuestionProps {
  answer?: AnswerData;
  onAnswer: (data: AnswerData) => void;
  language?: string;
  starterCode?: string;
}

/**
 * Кодын даалгавар — Monospace textarea + хэлний badge.
 */
export function CodeChallengeQuestion({
  answer,
  onAnswer,
  language,
  starterCode,
}: CodeChallengeQuestionProps) {
  const t = useTranslations('quiz');
  const value = answer?.submittedCode || starterCode || '';

  return (
    <div className="space-y-3">
      {/* Хэлний badge */}
      {language && (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            {language}
          </span>
        </div>
      )}

      {/* Код editor */}
      <div className="relative rounded-xl overflow-hidden border-2 border-border">
        <div className="bg-foreground/5 dark:bg-background px-4 py-2 border-b border-border flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-400/60" />
            <div className="size-3 rounded-full bg-amber-400/60" />
            <div className="size-3 rounded-full bg-emerald-400/60" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">
            {language || 'code'}.
            {language === 'python'
              ? 'py'
              : language === 'javascript'
                ? 'js'
                : language === 'java'
                  ? 'java'
                  : 'txt'}
          </span>
        </div>
        <textarea
          value={value}
          onChange={(e) => onAnswer({ submittedCode: e.target.value })}
          placeholder={t('codePlaceholder')}
          rows={15}
          spellCheck={false}
          className="w-full px-4 py-3 bg-foreground/[0.03] dark:bg-background text-foreground placeholder:text-muted-foreground/40 font-mono text-sm leading-relaxed outline-none resize-y"
        />
      </div>
    </div>
  );
}
