'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface QuizResultsSummaryProps {
  score: number;
  maxScore: number;
  passed: boolean;
  scorePercentage: number;
}

/**
 * Medal тодорхойлох: 70-79 Bronze, 80-89 Silver, 90-99 Gold, 100 Supreme.
 */
function getMedal(percentage: number) {
  if (percentage >= 100) return { label: 'medalSupreme', icon: '💎', color: 'text-cyan-500' };
  if (percentage >= 90) return { label: 'medalGold', icon: '🥇', color: 'text-amber-400' };
  if (percentage >= 80) return { label: 'medalSilver', icon: '🥈', color: 'text-slate-400' };
  if (percentage >= 70) return { label: 'medalBronze', icon: '🥉', color: 'text-amber-600' };
  return null;
}

/**
 * Шалгалтын дүнгийн нэгтгэл — 3 карт + medal + confetti + score animation.
 */
export function QuizResultsSummary({
  score,
  maxScore,
  passed,
  scorePercentage,
}: QuizResultsSummaryProps) {
  const t = useTranslations('quiz');
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const confettiFired = useRef(false);

  const medal = getMedal(scorePercentage);

  /** Score counting animation */
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      /** Ease-out function */
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      setAnimatedPercentage(Math.round(eased * scorePercentage));

      if (step >= steps) {
        clearInterval(interval);
        setAnimatedScore(score);
        setAnimatedPercentage(scorePercentage);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [score, scorePercentage]);

  /** Тэнцсэн бол confetti */
  useEffect(() => {
    if (passed && !confettiFired.current) {
      confettiFired.current = true;
      /** Бага зэрэг delay-ийн дараа confetti шидэх */
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#9c7aff', '#10b981', '#f59e0b', '#ec4899'],
        });
      }, 800);
    }
  }, [passed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      {/* Нийт оноо */}
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-card border border-border shadow-sm">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {t('totalScore')}
        </p>
        <p className="text-foreground text-3xl font-bold leading-tight tabular-nums">
          {animatedScore} / {maxScore}
        </p>
        <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>

      {/* Хувь + Medal */}
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-card border border-border shadow-sm">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {t('percentage')}
        </p>
        <p className="text-foreground text-3xl font-bold leading-tight tabular-nums">
          {animatedPercentage}%
        </p>
        {medal && (
          <p className={cn('text-sm font-medium', medal.color)}>
            {medal.icon}{' '}
            {t(medal.label as 'medalBronze' | 'medalSilver' | 'medalGold' | 'medalSupreme')}
          </p>
        )}
      </div>

      {/* Төлөв */}
      <div
        className={cn(
          'flex flex-col gap-2 rounded-xl p-6 border shadow-sm',
          passed
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800',
        )}
      >
        <p
          className={cn(
            'text-sm font-medium uppercase tracking-wider',
            passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
          )}
        >
          {t('status')}
        </p>
        <div className="flex items-center gap-2">
          {passed ? (
            <CheckCircle className="size-8 text-emerald-500" />
          ) : (
            <XCircle className="size-8 text-red-500" />
          )}
          <p
            className={cn(
              'text-3xl font-bold leading-tight',
              passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
            )}
          >
            {passed ? t('passed') : t('failed')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
