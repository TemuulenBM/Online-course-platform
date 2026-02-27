'use client';

import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { AnswerData } from '@/lib/api-services/quizzes.service';

interface TrueFalseQuestionProps {
  answer?: AnswerData;
  onAnswer: (data: AnswerData) => void;
}

/**
 * Үнэн/Худал асуулт — 2 том карт: "Үнэн" болон "Худал".
 */
export function TrueFalseQuestion({ answer, onAnswer }: TrueFalseQuestionProps) {
  const t = useTranslations('quiz');
  const selected = answer?.selectedAnswer;

  const options = [
    { value: true, label: t('trueOption'), icon: Check, color: 'emerald' as const },
    { value: false, label: t('falseOption'), icon: X, color: 'red' as const },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        const Icon = opt.icon;

        return (
          <motion.button
            key={String(opt.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer({ selectedAnswer: opt.value })}
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 transition-all duration-200 cursor-pointer',
              isSelected && opt.color === 'emerald'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                : isSelected && opt.color === 'red'
                  ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                  : 'border-border bg-secondary/50 hover:border-primary/40',
            )}
          >
            <div
              className={cn(
                'size-12 rounded-full flex items-center justify-center',
                isSelected && opt.color === 'emerald'
                  ? 'bg-emerald-500 text-white'
                  : isSelected && opt.color === 'red'
                    ? 'bg-red-500 text-white'
                    : 'bg-secondary text-muted-foreground',
              )}
            >
              <Icon className="size-6" />
            </div>
            <span
              className={cn(
                'font-bold text-lg',
                isSelected ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {opt.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
