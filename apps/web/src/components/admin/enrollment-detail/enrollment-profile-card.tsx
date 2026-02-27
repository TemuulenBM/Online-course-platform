'use client';

import { BookOpen, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EnrollmentWithCourse } from '@ocp/shared-types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

/** Статус badge-ийн өнгө */
const statusBadgeStyles: Record<string, string> = {
  active: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  expired: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
};

interface EnrollmentProfileCardProps {
  enrollment: EnrollmentWithCourse;
}

/** Нэрний эхний үсгүүдийг авах */
function getInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Оюутны profile header card */
export function EnrollmentProfileCard({ enrollment }: EnrollmentProfileCardProps) {
  const t = useTranslations('enrollments');

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="size-24 border-4 border-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
              {getInitials(enrollment.userName)}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute bottom-0 right-0 size-6 rounded-full border-4 border-white dark:border-slate-900 ${enrollment.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}
          />
        </div>

        <div className="flex-1">
          {/* Нэр + badge */}
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {enrollment.userName || '—'}
            </h1>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusBadgeStyles[enrollment.status] || statusBadgeStyles.active}`}
            >
              {enrollment.status}
            </span>
          </div>

          {/* ID */}
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t('studentId')}: {enrollment.userId?.substring(0, 8) || '—'}
          </p>

          {/* Course + Date cards */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <BookOpen className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {t('currentCourse')}
                </p>
                <p className="text-sm font-semibold">{enrollment.courseTitle || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <Calendar className="size-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {t('enrollmentDate')}
                </p>
                <p className="text-sm font-semibold">
                  {enrollment.createdAt
                    ? new Date(enrollment.createdAt).toLocaleDateString('mn-MN')
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
