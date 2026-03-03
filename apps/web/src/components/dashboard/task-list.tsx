'use client';

import Link from 'next/link';
import { ChevronRight, Video, CalendarClock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUpcomingSessions } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

/** Огноог "Өнөөдөр 14:00", "Маргааш 09:30" гэх хэлбэрт хөрвүүлнэ */
function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);
  const dayAfterStart = new Date(todayStart);
  dayAfterStart.setDate(todayStart.getDate() + 2);

  const timeStr = date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

  if (date >= todayStart && date < tomorrowStart) return `Өнөөдөр ${timeStr}`;
  if (date >= tomorrowStart && date < dayAfterStart) return `Маргааш ${timeStr}`;

  return date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }) + ` ${timeStr}`;
}

export function TaskList() {
  const t = useTranslations('dashboard');
  const { data, isLoading } = useUpcomingSessions({ limit: 3 });

  const sessions = data?.data ?? [];

  return (
    <div className="flex flex-col bg-card rounded-2xl p-6 border border-border shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[17px] font-bold text-foreground">{t('upcomingSessions')}</h2>
        <Link
          href={ROUTES.LIVE_SESSIONS}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          aria-label={t('seeAll')}
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          /** Skeleton loading */
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))
        ) : sessions.length === 0 ? (
          /** Empty state */
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <CalendarClock className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">{t('noUpcomingSessions')}</p>
          </div>
        ) : (
          /** Жинхэнэ session жагсаалт */
          sessions.map((session) => (
            <Link
              key={session.id}
              href={ROUTES.LIVE_SESSIONS}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/15 shadow-sm group-hover:bg-primary/15 transition-colors shrink-0">
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-foreground mb-0.5 line-clamp-1">
                    {session.title}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                    {formatSessionDate(session.scheduledStart)}
                  </span>
                </div>
              </div>
              <ChevronRight
                className="w-5 h-5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0"
                strokeWidth={2.5}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
