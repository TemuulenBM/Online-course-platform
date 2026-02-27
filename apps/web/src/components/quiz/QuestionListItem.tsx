'use client';

import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/api-services/quizzes.service';

interface QuestionListItemProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

/** Асуултын төрлийн label */
const typeLabels: Record<string, string> = {
  multiple_choice: 'MULTIPLE CHOICE',
  true_false: 'TRUE / FALSE',
  fill_blank: 'FILL BLANK',
  essay: 'ESSAY',
  code_challenge: 'CODE',
};

/** Хүндрэлийн label */
const difficultyLabels: Record<string, string> = {
  easy: 'Хялбар',
  medium: 'Дунд',
  hard: 'Хэцүү',
};

/**
 * Жагсаалт дахь нэг асуултын мөр.
 * Drag handle + question text + type badge + difficulty + points + actions.
 */
export function QuestionListItem({
  question,
  isSelected,
  onSelect,
  onDelete,
}: QuestionListItemProps) {
  const t = useTranslations('quiz');

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/40',
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <GripVertical className="size-5 text-muted-foreground/40 shrink-0 cursor-grab" />

      {/* Мэдээлэл */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{question.questionText}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
            {typeLabels[question.type] || question.type}
          </Badge>
          {question.difficulty && (
            <span className="text-[10px] text-muted-foreground">
              {difficultyLabels[question.difficulty] || question.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Оноо */}
      <span className="text-sm font-bold text-primary shrink-0">
        {question.points} {t('points')}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-red-500 hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
