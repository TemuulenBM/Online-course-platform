'use client';

import Link from 'next/link';
import { ChevronRight, Video, CalendarClock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useUpcomingSessions, useCourseList } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

/** Стagger variants */
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const listItem = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

/** Огноог "Өнөөдөр 14:00", "Маргааш 09:30" гэх хэлбэрт хөрвүүлнэ */
function formatSessionDate(dateStr: string): { text: string; isToday: boolean } {
  const date = new Date(dateStr);
  const now = new Date();

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);
  const dayAfterStart = new Date(todayStart);
  dayAfterStart.setDate(todayStart.getDate() + 2);

  const timeStr = date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

  if (date >= todayStart && date < tomorrowStart)
    return { text: `Өнөөдөр ${timeStr}`, isToday: true };
  if (date >= tomorrowStart && date < dayAfterStart)
    return { text: `Маргааш ${timeStr}`, isToday: false };

  const dateText =
    date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }) + ` ${timeStr}`;
  return { text: dateText, isToday: false };
}

export function TaskList() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('courses');
  const { data, isLoading } = useUpcomingSessions({ limit: 3 });

  const sessions = data?.data ?? [];

  /** Sessions хоосон үед санал болгох сургалтууд авах */
  const showRecommended = !isLoading && sessions.length === 0;
  const { data: coursesData } = useCourseList(showRecommended ? { page: 1, limit: 3 } : undefined);
  const recommendedCourses = coursesData?.data ?? [];

  return (
    <div className="flex flex-col bg-card rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-foreground tracking-tight">
          {sessions.length === 0 && !isLoading ? t('recommendedCourses') : t('upcomingSessions')}
        </h2>
        <Link
          href={sessions.length === 0 && !isLoading ? ROUTES.COURSES : ROUTES.LIVE_SESSIONS}
          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          aria-label={t('seeAll')}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        recommendedCourses.length > 0 ? (
          <motion.div
            className="flex flex-col gap-3"
            variants={listContainer}
            initial="hidden"
            animate="show"
          >
            {recommendedCourses.map((course) => (
              <motion.div key={course.id} variants={listItem} whileHover={{ x: 4 }}>
                <Link
                  href={ROUTES.COURSE_DETAIL(course.slug)}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                      <BookOpen className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {course.title}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {tc(course.difficulty.toLowerCase())}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0"
                    strokeWidth={2.5}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2">
              <CalendarClock className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="text-xs font-medium text-muted-foreground/60">
              {t('noUpcomingSessions')}
            </p>
          </div>
        )
      ) : (
        <motion.div
          className="flex flex-col gap-4"
          variants={listContainer}
          initial="hidden"
          animate="show"
        >
          {sessions.map((session) => {
            const { text: dateText, isToday } = formatSessionDate(session.scheduledStart);
            return (
              <motion.div key={session.id} variants={listItem} whileHover={{ x: 4 }}>
                <Link
                  href={ROUTES.LIVE_SESSIONS}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                      <Video className="w-4.5 h-4.5 text-primary" />
                      {/* Өнөөдрийн session — pulse dot */}
                      {isToday && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {session.title}
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {dateText}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0"
                    strokeWidth={2.5}
                  />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
