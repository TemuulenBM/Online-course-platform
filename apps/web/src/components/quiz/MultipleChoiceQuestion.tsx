'use client';

import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AnswerData, QuestionOption } from '@/lib/api-services/quizzes.service';

interface MultipleChoiceQuestionProps {
  options: QuestionOption[];
  answer?: AnswerData;
  onAnswer: (data: AnswerData) => void;
}

/**
 * Олон сонголттой асуулт — Radio button стайлтай сонголтууд.
 * Сонгосон сонголтод primary border + checkmark icon харагдана.
 */
export function MultipleChoiceQuestion({ options, answer, onAnswer }: MultipleChoiceQuestionProps) {
  const selectedOptionId = answer?.selectedOption;

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedOptionId === option.optionId;

        return (
          <motion.label
            key={option.optionId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            className={cn(
              'group relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-secondary/50 hover:border-primary/40',
            )}
          >
            {/* Radio circle */}
            <motion.div
              className={cn(
                'size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40',
              )}
              animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              {isSelected && <div className="size-2 rounded-full bg-primary-foreground" />}
            </motion.div>

            {/* Текст */}
            <div className="ml-4 flex justify-between items-center w-full">
              <span
                className={cn(
                  'font-medium transition-colors',
                  isSelected ? 'text-foreground font-bold text-lg' : 'text-muted-foreground',
                )}
              >
                {option.text}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <CheckCircle className="size-5 text-primary" />
                </motion.div>
              )}
            </div>

            {/* Далд radio input */}
            <input
              type="radio"
              name="quiz-option"
              className="sr-only"
              checked={isSelected}
              onChange={() => onAnswer({ selectedOption: option.optionId })}
            />
          </motion.label>
        );
      })}
    </div>
  );
}
