'use client';

import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useMyProgress } from '@/hooks/api';
import { useStreak } from '@/hooks/use-streak';
import { Skeleton } from '@/components/ui/skeleton';

/** Долоо хоногийн өдрийн товчлол */
const WEEK_DAYS = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

/** Долоо хоногийн зорилго (хичээлийн тоо) */
const WEEKLY_GOAL = 7;

/** Heatmap нүдний intensity-г тодорхойлох */
function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-muted';
  if (count === 1) return 'bg-primary/25';
  if (count === 2) return 'bg-primary/50';
  return 'bg-primary/80';
}

/** Heatmap cell stagger animation */
const cellVariant = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
};

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.012, delayChildren: 0.2 } },
};

/**
 * Сүүлийн 28 хоногийн (4 долоо хоног) completedAt огноогоор бүлэглэнэ.
 * { '2026-03-08': 3, '2026-03-07': 1, ... }
 */
function groupByDate(
  progressList: Array<{ completed: boolean; completedAt: string | null }>,
): Map<string, number> {
  const map = new Map<string, number>();
  progressList.forEach((p) => {
    if (!p.completed || !p.completedAt) return;
    const dateStr = new Date(p.completedAt).toISOString().slice(0, 10);
    map.set(dateStr, (map.get(dateStr) ?? 0) + 1);
  });
  return map;
}

/**
 * Сүүлийн 28 хоногийн огнооны массив буцаана (Даваагаас эхлэн).
 * 4 долоо хоног × 7 өдөр = 28 нүд
 */
function getLast28Days(): string[] {
  const now = new Date();
  const todayDow = (now.getDay() + 6) % 7; // Да=0, Ня=6
  /** Энэ долоо хоногийн Даваа */
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - todayDow);
  thisMonday.setHours(0, 0, 0, 0);
  /** 3 долоо хоногийн өмнөх Даваа */
  const startDate = new Date(thisMonday);
  startDate.setDate(thisMonday.getDate() - 21);

  const days: string[] = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/**
 * LearningStreakCard — GitHub-style heatmap + streak тоолуур.
 * Retention-ийн гол элемент: сурагч "хоосон нүд дүүргэх" хүсэлтэй болно.
 */
export function LearningStreakCard() {
  const t = useTranslations('dashboard');
  const streakCount = useStreak();
  const { data: progressData, isLoading } = useMyProgress({ page: 1, limit: 200 });

  /** Сүүлийн 28 хоногийн огнооны массив */
  const last28Days = useMemo(() => getLast28Days(), []);

  /** Огноогоор бүлэглэсэн completion map */
  const dateMap = useMemo(() => groupByDate(progressData?.data ?? []), [progressData?.data]);

  /** Энэ долоо хоногийн нийт дуусгасан хичээл */
  const todayIdx = (new Date().getDay() + 6) % 7;
  const thisWeekDays = last28Days.slice(21, 28); // Сүүлийн 7 хоног
  const thisWeekTotal = thisWeekDays.reduce((sum, d) => sum + (dateMap.get(d) ?? 0), 0);
  const goalPercent = Math.min(Math.round((thisWeekTotal / WEEKLY_GOAL) * 100), 100);

  /** Өнөөдрийн огноо */
  const todayStr = new Date().toISOString().slice(0, 10);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 h-full">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-8 w-48 mb-5" />
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 28 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground">{t('learningActivity')}</span>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
          {t('weekly')}
        </span>
      </div>

      {/* Streak тоолуур */}
      <div className="flex items-center gap-2 mb-5">
        {streakCount > 0 && (
          <Flame
            className="w-5 h-5 text-orange-500"
            style={{ animation: 'flicker 1.5s ease-in-out infinite' }}
          />
        )}
        <span className="text-lg font-bold text-foreground">
          {streakCount > 0
            ? t('streakDays', { count: streakCount })
            : t('lessonsCompleted', { count: thisWeekTotal })}
        </span>
      </div>

      {/* 28 хоногийн heatmap grid — 7 багана × 4 мөр */}
      <motion.div
        className="grid grid-cols-7 gap-1.5 mb-4"
        variants={gridContainer}
        initial="hidden"
        animate="show"
      >
        {last28Days.map((dateStr, i) => {
          const count = dateMap.get(dateStr) ?? 0;
          const isToday = dateStr === todayStr;
          return (
            <motion.div
              key={dateStr}
              variants={cellVariant}
              className={`aspect-square rounded-[5px] ${getIntensityClass(count)} ${isToday ? 'ring-2 ring-primary/40 ring-offset-1 ring-offset-card' : ''} transition-colors`}
              title={`${dateStr}: ${count} хичээл`}
            />
          );
        })}
      </motion.div>

      {/* Долоо хоногийн өдрийн нэрс */}
      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {WEEK_DAYS.map((day, i) => (
          <span
            key={day}
            className={`text-[9px] font-bold text-center ${i === todayIdx ? 'text-primary' : 'text-muted-foreground/60'}`}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Долоо хоногийн зорилгын progress */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            {t('weeklyGoal')}: {thisWeekTotal}/{WEEKLY_GOAL}
          </span>
          <span className="text-[11px] font-bold text-primary">{goalPercent}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${goalPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
