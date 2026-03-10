'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Video,
  BookOpen,
  Radio,
  CalendarDays,
  Clock,
  ChevronRight,
  Users,
  PlusCircle,
  History,
  Sparkles,
  CalendarPlus,
  VideoIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Course, LiveSession, CreateLiveSessionData } from '@ocp/shared-types';
import { toast } from 'sonner';

import {
  useMyCourses,
  useAllCourseSessions,
  useCreateLiveSession,
  useStartLiveSession,
} from '@/hooks/api';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateSessionDialog } from '@/components/live-sessions/teacher/create-session-dialog';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ─── Animation variants ─────────────────────────────────────────

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const section = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const listItem = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const cardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ─── Utility функцууд ────────────────────────────────────────────

/** Хугацааг минутаар тооцоолно */
function durationMins(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

/** Огноо format хийх — "3 сар 15" */
function formatSessionDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  return { day: d.getDate(), month: `${months[d.getMonth()]} сар` };
}

/** Цаг format — "14:30" */
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ─── Quick Schedule Action (PageHeader-д) ────────────────────────

/** Хурдан хичээл товлох — сургалт сонгож CreateSessionDialog нээнэ */
function QuickScheduleAction({ courses }: { courses: Course[] }) {
  const t = useTranslations('teacher');
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses.length === 1 ? courses[0].id : '',
  );
  const createMutation = useCreateLiveSession();
  const startMutation = useStartLiveSession();

  /** Товлосон хичээл хадгалах */
  const handleSubmit = (data: CreateLiveSessionData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success(t('sessionCreated'));
      },
    });
  };

  /** Шууд эхлүүлэх */
  const handleStartNow = (title: string, durationMinutes: number, description?: string) => {
    if (!selectedCourseId) return;
    const now = new Date();
    const end = new Date(now.getTime() + durationMinutes * 60000);
    createMutation.mutate(
      {
        courseId: selectedCourseId,
        title,
        description,
        scheduledStart: now.toISOString(),
        scheduledEnd: end.toISOString(),
      },
      {
        onSuccess: (created) => {
          const sessionId = (created as { id: string })?.id;
          if (sessionId) {
            startMutation.mutate(sessionId, {
              onSuccess: () => {
                toast.success(t('sessionStarted'));
                router.push(ROUTES.TEACHER_LIVE_SESSIONS(selectedCourseId));
              },
            });
          }
        },
      },
    );
  };

  /** Ганц course → шууд dialog, олон course → select + dialog */
  if (courses.length === 1) {
    return (
      <CreateSessionDialog
        courseId={courses[0].id}
        onSubmit={handleSubmit}
        onStartNow={handleStartNow}
        isPending={createMutation.isPending}
        isStartingNow={startMutation.isPending}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
        <SelectTrigger className="w-[200px] rounded-xl text-sm">
          <SelectValue placeholder={t('selectCourse')} />
        </SelectTrigger>
        <SelectContent>
          {courses.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCourseId ? (
        <CreateSessionDialog
          courseId={selectedCourseId}
          onSubmit={handleSubmit}
          onStartNow={handleStartNow}
          isPending={createMutation.isPending}
          isStartingNow={startMutation.isPending}
        />
      ) : (
        <Button disabled className="gap-2 rounded-xl font-bold">
          <PlusCircle className="size-5" />
          {t('scheduleSession')}
        </Button>
      )}
    </div>
  );
}

// ─── Timeline Item (Upcoming) ────────────────────────────────────

/** Upcoming session timeline item */
function TimelineItem({ session }: { session: LiveSession }) {
  const { day, month } = formatSessionDate(session.scheduledStart);
  const mins = durationMins(session.scheduledStart, session.scheduledEnd);

  return (
    <motion.div
      variants={listItem}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
    >
      {/* Огноо chip */}
      <div className="shrink-0 w-14 text-center">
        <div className="bg-primary/10 dark:bg-primary/20 rounded-xl px-2 py-2">
          <p className="text-lg font-bold text-primary leading-none">{day}</p>
          <p className="text-[9px] font-semibold text-primary/60 uppercase mt-0.5">{month}</p>
        </div>
      </div>

      {/* Session мэдээлэл */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{session.title}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {session.courseTitle ?? 'Сургалт'} · {formatTime(session.scheduledStart)} · {mins} мин
        </p>
      </div>

      {/* Удирдах линк */}
      {session.courseId && (
        <Link
          href={ROUTES.TEACHER_LIVE_SESSIONS(session.courseId)}
          className="shrink-0 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          Удирдах
          <ChevronRight className="size-3" />
        </Link>
      )}
    </motion.div>
  );
}

// ─── Ended Session Row ───────────────────────────────────────────

/** Дууссан session мөр */
function EndedSessionRow({ session }: { session: LiveSession }) {
  const { day, month } = formatSessionDate(session.actualEnd ?? session.scheduledEnd);
  const mins = durationMins(session.actualStart, session.actualEnd);

  return (
    <motion.div
      variants={listItem}
      whileHover={{ x: 4 }}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
    >
      {/* Огноо chip */}
      <div className="shrink-0 w-14 text-center">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-2">
          <p className="text-lg font-bold text-slate-600 dark:text-slate-300 leading-none">{day}</p>
          <p className="text-[9px] font-semibold text-slate-400 uppercase mt-0.5">{month}</p>
        </div>
      </div>

      {/* Session мэдээлэл */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{session.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{session.courseTitle ?? 'Сургалт'}</span>
          {mins > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 flex items-center gap-0.5">
                <Clock className="size-3" />
                {mins} мин
              </span>
            </>
          )}
          {(session.attendeeCount ?? 0) > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 flex items-center gap-0.5">
                <Users className="size-3" />
                {session.attendeeCount}
              </span>
            </>
          )}
          {session.recordingUrl && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-emerald-500 flex items-center gap-0.5">
                <VideoIcon className="size-3" />
                Бичлэг
              </span>
            </>
          )}
        </div>
      </div>

      {/* Линк */}
      {session.courseId && (
        <Link
          href={ROUTES.TEACHER_LIVE_SESSIONS(session.courseId)}
          className="shrink-0 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
        >
          Дэлгэрэнгүй
          <ChevronRight className="size-3" />
        </Link>
      )}
    </motion.div>
  );
}

// ─── Compact Course Card (оролцогч тоотой) ──────────────────────

/** Compact course card — оролцогчийн нийт тоотой */
function CompactCourseCard({
  course,
  liveCount,
  scheduledCount,
  endedCount,
  totalAttendees,
  nextSession,
}: {
  course: Course;
  liveCount: number;
  scheduledCount: number;
  endedCount: number;
  totalAttendees: number;
  nextSession?: LiveSession;
}) {
  return (
    <motion.div variants={cardItem} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={ROUTES.TEACHER_LIVE_SESSIONS(course.id)}
        className="group block bg-white dark:bg-slate-900 rounded-xl border border-primary/10 p-4 hover:border-primary/25 hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors flex-1">
            {course.title}
          </h4>
          {liveCount > 0 && (
            <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold">
              <span className="size-1.5 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Дараагийн session */}
        {nextSession && (
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <CalendarDays className="size-3 text-blue-500" />
            Дараагийн: {formatTime(nextSession.scheduledStart)},{' '}
            {new Date(nextSession.scheduledStart).toLocaleDateString('mn-MN')}
          </p>
        )}

        {/* Summary — оролцогч тоотой */}
        <div className="flex items-center gap-2.5 mt-2.5 text-[11px] text-slate-500">
          <span className="font-medium">{scheduledCount} товлосон</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-medium">{endedCount} дууссан</span>
          {totalAttendees > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-medium flex items-center gap-0.5">
                <Users className="size-3" />
                {totalAttendees}
              </span>
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Weekly Chart Custom Tooltip ─────────────────────────────────

/** Recharts tooltip */
function WeeklyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
      {payload[0].value} хичээл
    </div>
  );
}

// ─── Гол хуудас ──────────────────────────────────────────────────

/** Багшийн шууд хичээлийн overview — /teacher/live-sessions */
export default function TeacherLiveSessionsPage() {
  const t = useTranslations('teacher');
  const { data: courses, isLoading: coursesLoading } = useMyCourses();
  const courseIds = courses?.map((c: Course) => c.id) ?? [];
  const {
    allSessions,
    liveSessions,
    upcomingSessions,
    stats,
    isLoading: sessionsLoading,
  } = useAllCourseSessions(courseIds);

  void sessionsLoading;

  /** Дууссан хичээлүүд — сүүлийнх нь эхэнд */
  const endedSessions = useMemo(
    () =>
      allSessions
        .filter((s) => s.status === 'ended')
        .sort((a, b) => {
          const aEnd = a.actualEnd ?? a.scheduledEnd;
          const bEnd = b.actualEnd ?? b.scheduledEnd;
          return new Date(bEnd).getTime() - new Date(aEnd).getTime();
        })
        .slice(0, 5),
    [allSessions],
  );

  /** Долоо хоногийн chart дата — recharts infinite loop-оос хамгаалах */
  const weeklyChartData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Даваагаас эхэлнэ (0=Ням → Даваа = 1)
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + mondayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const dayLabels = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

    return dayLabels.map((label, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayStr = day.toDateString();
      const count = allSessions.filter((s) => {
        const sDate = new Date(s.scheduledStart);
        return sDate.toDateString() === dayStr;
      }).length;
      return {
        day: label,
        count,
        isToday: day.toDateString() === now.toDateString(),
      };
    });
  }, [allSessions]);

  /** Course тус бүрийн session тоо + оролцогчдын тоо */
  const getCourseSessionStats = (courseId: string) => ({
    liveCount: liveSessions.filter((s) => s.courseId === courseId).length,
    scheduledCount: upcomingSessions.filter((s) => s.courseId === courseId).length,
    endedCount: allSessions.filter((s) => s.courseId === courseId && s.status === 'ended').length,
    totalAttendees: allSessions
      .filter((s) => s.courseId === courseId && s.status === 'ended')
      .reduce((sum, s) => sum + (s.attendeeCount ?? 0), 0),
  });

  // ─── Loading state ──────────────────────────────────────────

  if (coursesLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Сургалт байхгүй ───────────────────────────────────────

  if (!courses?.length) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto">
          <EmptyState
            icon={BookOpen}
            title={t('noCourses')}
            description="Сургалт үүсгэсний дараа шууд хичээл товлох боломжтой."
            action={{ label: t('createCourse'), href: ROUTES.TEACHER_COURSE_NEW }}
          />
        </div>
      </div>
    );
  }

  // ─── Гол контент ────────────────────────────────────────────

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-6 lg:p-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* ── LIVE Alert Banner ── */}
        {liveSessions.length > 0 && (
          <motion.div
            variants={section}
            animate={{ opacity: [1, 0.95, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white p-5 shadow-lg">
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              </div>
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <Radio className="size-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      {liveSessions.length} шууд хичээл явагдаж байна!
                    </p>
                    <p className="text-xs text-white/70 mt-0.5">
                      {liveSessions.map((s) => s.title).join(', ')}
                    </p>
                  </div>
                </div>
                {liveSessions[0]?.courseId && (
                  <Link
                    href={ROUTES.TEACHER_LIVE_SESSIONS(liveSessions[0].courseId)}
                    className="shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-sm font-bold transition-colors"
                  >
                    Нээх
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PageHeader + Quick Action ── */}
        <motion.div variants={section}>
          <PageHeader
            icon={Video}
            title={t('liveSessions')}
            subtitle="Сургалтуудынхаа шууд хичээлүүдийг удирдах"
            actions={<QuickScheduleAction courses={courses} />}
          />
        </motion.div>

        {/* ── Stats Row (4 cards) ── */}
        <motion.div variants={section} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Явагдаж буй */}
          <div
            className={cn(
              'p-5 rounded-2xl border transition-shadow hover:shadow-lg',
              stats.liveCount > 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-white dark:bg-slate-900 border-primary/10',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  'size-10 rounded-xl flex items-center justify-center',
                  stats.liveCount > 0
                    ? 'bg-red-500/15 text-red-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
                )}
              >
                <Radio className={cn('size-5', stats.liveCount > 0 && 'animate-pulse')} />
              </div>
              {stats.liveCount > 0 && (
                <span className="size-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <p className="text-slate-500 text-xs font-medium">Явагдаж буй</p>
            <AnimatedCounter value={stats.liveCount} className="text-2xl font-bold mt-0.5 block" />
          </div>

          {/* Товлосон */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-primary/10 hover:shadow-lg transition-shadow">
            <div className="mb-3">
              <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                <CalendarDays className="size-5" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium">Товлосон</p>
            <AnimatedCounter
              value={stats.scheduledCount}
              className="text-2xl font-bold mt-0.5 block"
            />
          </div>

          {/* Дууссан */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-primary/10 hover:shadow-lg transition-shadow">
            <div className="mb-3">
              <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center">
                <Clock className="size-5" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium">Дууссан</p>
            <AnimatedCounter value={stats.endedCount} className="text-2xl font-bold mt-0.5 block" />
          </div>

          {/* Нийт сургалт */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-primary/10 hover:shadow-lg transition-shadow">
            <div className="mb-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="size-5" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium">Нийт сургалт</p>
            <AnimatedCounter value={courses.length} className="text-2xl font-bold mt-0.5 block" />
          </div>
        </motion.div>

        {/* ── Section: Upcoming | Courses ── */}
        <motion.div variants={section} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Зүүн 2/3 — Upcoming Sessions Timeline */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                Удахгүй болох хичээлүүд
              </h3>
              <span className="text-xs text-slate-500">{upcomingSessions.length} товлосон</span>
            </div>

            {upcomingSessions.length === 0 ? (
              /* Сайжруулсан Empty State */
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 size-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <CalendarPlus className="size-8 text-primary/60" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('scheduleFirst')}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
                  {t('scheduleFirstDesc')}
                </p>
                {courses.length === 1 && (
                  <Link
                    href={ROUTES.TEACHER_LIVE_SESSIONS(courses[0].id)}
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    <PlusCircle className="size-3.5" />
                    {t('scheduleSession')}
                  </Link>
                )}
              </div>
            ) : (
              <motion.div
                className="divide-y divide-slate-100 dark:divide-slate-800"
                variants={listStagger}
                initial="hidden"
                animate="show"
              >
                {upcomingSessions.slice(0, 7).map((session) => (
                  <TimelineItem key={session.id} session={session} />
                ))}
              </motion.div>
            )}
          </div>

          {/* Баруун 1/3 — Course Cards */}
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Сургалтууд
            </h3>
            <motion.div
              className="space-y-3"
              variants={cardStagger}
              initial="hidden"
              animate="show"
            >
              {courses.map((course: Course) => {
                const courseStats = getCourseSessionStats(course.id);
                const nextForCourse = upcomingSessions.find((s) => s.courseId === course.id);
                return (
                  <CompactCourseCard
                    key={course.id}
                    course={course}
                    liveCount={courseStats.liveCount}
                    scheduledCount={courseStats.scheduledCount}
                    endedCount={courseStats.endedCount}
                    totalAttendees={courseStats.totalAttendees}
                    nextSession={nextForCourse}
                  />
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* ── Section: Weekly Chart | Ended Sessions ── */}
        <motion.div variants={section} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Зүүн 1/3 — Weekly Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 p-5">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <CalendarDays className="size-4 text-primary" />
              {t('weeklyOverview')}
            </h3>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} barCategoryGap="20%">
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: 'var(--color-slate-400)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<WeeklyTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {weeklyChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? 'var(--primary)' : 'var(--primary)'}
                        fillOpacity={entry.isToday ? 1 : 0.25}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Нийт тоо */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Нийт энэ 7 хоногт</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {weeklyChartData.reduce((s, d) => s + d.count, 0)} хичээл
              </span>
            </div>
          </div>

          {/* Баруун 2/3 — Ended Sessions */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <History className="size-4 text-primary" />
                {t('recentEndedSessions')}
              </h3>
              <span className="text-xs text-slate-500">{stats.endedCount} нийт</span>
            </div>

            {endedSessions.length === 0 ? (
              /* Баяжуулсан Empty State */
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 size-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10 flex items-center justify-center">
                  <Sparkles className="size-8 text-emerald-500/60" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('noEndedSessions')}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">
                  {t('noEndedSessionsDesc')}
                </p>
              </div>
            ) : (
              <motion.div
                className="divide-y divide-slate-100 dark:divide-slate-800"
                variants={listStagger}
                initial="hidden"
                animate="show"
              >
                {endedSessions.map((session) => (
                  <EndedSessionRow key={session.id} session={session} />
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
