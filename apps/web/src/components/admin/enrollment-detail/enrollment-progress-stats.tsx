'use client';

import { useTranslations } from 'next-intl';

interface EnrollmentProgressStatsProps {
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
}

/** Ахицын тойм + Ирцийн хувь карт (2 column) */
export function EnrollmentProgressStats({
  progressPercentage,
  completedLessons,
  totalLessons,
}: EnrollmentProgressStatsProps) {
  const t = useTranslations('enrollments');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Progress */}
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10">
        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">
          {t('progressOverview')}
        </h3>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-primary">{progressPercentage}%</span>
          <span className="text-sm text-slate-500">
            {completedLessons} / {totalLessons} {t('modules')}
          </span>
        </div>
        <div className="w-full bg-primary/10 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Attendance — placeholder */}
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10">
        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">
          {t('attendanceRate')}
        </h3>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-bold text-slate-300 dark:text-slate-600">
            {t('notAvailable')}
          </span>
          <span className="text-sm text-slate-400">{t('comingSoon')}</span>
        </div>
        <div className="w-full bg-primary/10 rounded-full h-2">
          <div className="bg-slate-200 dark:bg-slate-700 h-2 rounded-full w-0" />
        </div>
      </div>
    </div>
  );
}
