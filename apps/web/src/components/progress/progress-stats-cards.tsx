'use client';

import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProgressStatsCardsProps {
  totalCourses: number;
  completedCourses: number;
  totalTimeSpentSeconds: number;
  avgProgressPercentage: number;
}

/** Секундийг "Xц Yм" формат руу хөрвүүлэх */
function formatTime(seconds: number, h: string, m: string): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}${h} ${mins}${m}`;
}

/** Ахицын 4 статистик card */
export function ProgressStatsCards({
  totalCourses,
  completedCourses,
  totalTimeSpentSeconds,
  avgProgressPercentage,
}: ProgressStatsCardsProps) {
  const t = useTranslations('progress');

  const cards = [
    {
      label: t('totalLessons'),
      value: totalCourses.toString(),
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: t('completedCount'),
      value: completedCourses.toString(),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: t('timeSpent'),
      value: formatTime(totalTimeSpentSeconds, t('hours'), t('minutes')),
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: t('avgProgress'),
      value: `${avgProgressPercentage}%`,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 p-5 flex items-center gap-4"
        >
          <div className={`size-12 rounded-xl ${card.bg} flex items-center justify-center`}>
            <card.icon className={`size-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
