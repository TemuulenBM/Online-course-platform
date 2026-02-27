'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  voteScore: number;
  userVote: 'up' | 'down' | null;
  onVote: (voteType: 'up' | 'down') => void;
  variant?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md';
}

/** Up/Down vote товчнууд — vertical (sidebar) болон horizontal (inline) variant */
export function VoteButtons({
  voteScore,
  userVote,
  onVote,
  variant = 'vertical',
  size = 'md',
}: VoteButtonsProps) {
  const iconSize = size === 'sm' ? 'size-4' : 'size-5';
  const btnSize = size === 'sm' ? 'size-7' : 'size-9';

  const upButton = (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={() => onVote('up')}
      aria-label="Дээш санал өгөх"
      className={cn(
        btnSize,
        'flex items-center justify-center rounded-lg transition-colors',
        userVote === 'up'
          ? 'bg-primary/15 text-primary'
          : 'text-slate-400 hover:bg-primary/10 hover:text-primary',
      )}
    >
      <ChevronUp className={iconSize} strokeWidth={2.5} />
    </motion.button>
  );

  const score = (
    <span
      className={cn(
        'font-bold tabular-nums',
        size === 'sm' ? 'text-sm' : 'text-lg',
        userVote === 'up' && 'text-primary',
        userVote === 'down' && 'text-red-500',
        !userVote && 'text-slate-700 dark:text-slate-300',
      )}
    >
      {voteScore}
    </span>
  );

  const downButton = (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={() => onVote('down')}
      aria-label="Доош санал өгөх"
      className={cn(
        btnSize,
        'flex items-center justify-center rounded-lg transition-colors',
        userVote === 'down'
          ? 'bg-red-500/15 text-red-500'
          : 'text-slate-400 hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-900/20',
      )}
    >
      <ChevronDown className={iconSize} strokeWidth={2.5} />
    </motion.button>
  );

  if (variant === 'horizontal') {
    return (
      <div className="flex items-center gap-1">
        {upButton}
        {score}
        {downButton}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      {upButton}
      {score}
      {downButton}
    </div>
  );
}
