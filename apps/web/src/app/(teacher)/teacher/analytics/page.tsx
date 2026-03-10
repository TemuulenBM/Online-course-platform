'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Users,
  CheckCircle2,
  Award,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import type { Course } from '@ocp/shared-types';

import { useMyCourses, useMultipleCourseStats } from '@/hooks/api';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ROUTES } from '@/lib/constants';
import { cn, formatMNT, formatNumber } from '@/lib/utils';

/** Stagger animation variants — student dashboard-тай нийцсэн */
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

const cardGrid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/** Сургалтын аналитик карт — redesigned with thumbnail + progress bar */
function CourseAnalyticsCard({
  course,
  stats,
  statsLoading,
}: {
  course: Course;
  stats?: { totalEnrollments?: number; completionRate?: number; avgProgress?: number };
  statsLoading: boolean;
}) {
  return (
    <motion.div variants={cardItem} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={ROUTES.TEACHER_COURSE_ANALYTICS(course.id)}
        className="group block bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 overflow-hidden hover:border-primary/25 hover:shadow-lg transition-all"
      >
        {/* Thumbnail хэсэг */}
        <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-violet-100 dark:from-primary/30 dark:via-primary/15 dark:to-violet-900/30 overflow-hidden">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="size-10 text-primary/20" />
            </div>
          )}
          {/* Status badge overlay */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm',
                course.status === 'published'
                  ? 'bg-emerald-500/90 text-white'
                  : course.status === 'draft'
                    ? 'bg-amber-500/90 text-white'
                    : 'bg-slate-500/90 text-white',
              )}
            >
              {course.status === 'published'
                ? 'Нийтлэгдсэн'
                : course.status === 'draft'
                  ? 'Ноорог'
                  : 'Архивлагдсан'}
            </span>
          </div>
          {/* Arrow overlay */}
          <div className="absolute top-3 right-3 size-7 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="size-4 text-primary" />
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {course.categoryName ?? course.difficulty}
          </p>

          {/* Stat-ууд */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            {statsLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Users className="size-3 text-primary/60" />
                  <span className="font-semibold">
                    {formatNumber(stats?.totalEnrollments ?? 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  <span className="font-semibold">{stats?.completionRate ?? 0}%</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <TrendingUp className="size-3 text-violet-500" />
                  <span className="font-semibold">{stats?.avgProgress?.toFixed(0) ?? 0}%</span>
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          {!statsLoading && (
            <div className="mt-3">
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stats?.avgProgress ?? 0, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/** Багшийн аналитик overview — /teacher/analytics */
export default function TeacherAnalyticsPage() {
  const t = useTranslations('teacher');
  const { data: courses, isLoading: coursesLoading } = useMyCourses();
  const courseIds = courses?.map((c: Course) => c.id) ?? [];
  const {
    queries: statsQueries,
    aggregated,
    isLoading: statsLoading,
  } = useMultipleCourseStats(courseIds);

  const circumference = 2 * Math.PI * 52;
  const completionForRing = aggregated.avgCompletionRate;

  if (coursesLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <Skeleton className="h-[200px] rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!courses?.length) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto">
          <EmptyState
            icon={BookOpen}
            title={t('noCourses')}
            description="Сургалт үүсгэсний дараа аналитик харах боломжтой."
            action={{ label: t('createCourse'), href: ROUTES.TEACHER_COURSE_NEW }}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-6 lg:p-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Section 1 — Gradient Hero Banner */}
        <motion.div variants={section}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary/80 to-violet-900 min-h-[200px] flex items-center shadow-lg">
            {/* Чимэглэлийн blur circle-ууд */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-[40%] w-[200px] h-[200px] bg-violet-300/10 rounded-full blur-2xl translate-y-1/2" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-6 p-8 md:p-10">
              {/* Зүүн хэсэг — текст */}
              <div className="flex-1 max-w-lg">
                <div className="flex items-center gap-2 mb-3">
                  <SidebarTrigger className="md:hidden text-white/60 hover:text-white" />
                  <div className="size-6 rounded-full bg-white/15 flex items-center justify-center">
                    <BarChart3 className="size-3.5 text-white" />
                  </div>
                  <span className="text-xs font-bold tracking-widest text-white/60 uppercase">
                    {t('analytics')}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                  Миний аналитик
                </h1>
                <p className="text-sm text-white/60">
                  {courses.length} сургалтын нэгдсэн гүйцэтгэлийн тойм
                </p>
              </div>

              {/* Баруун хэсэг — animated progress ring + нийт суралцагч */}
              <div className="hidden md:flex shrink-0 items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r="52"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="52"
                      fill="none"
                      stroke="rgba(255,255,255,0.85)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{
                        strokeDashoffset: circumference * (1 - completionForRing / 100),
                      }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <AnimatedCounter
                      value={completionForRing}
                      formatFn={(n) => `${n}%`}
                      className="text-2xl font-bold text-white"
                    />
                    <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mt-0.5">
                      Дуусгалт
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2 — Aggregate Stats Row */}
        <motion.div variants={section} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Нийт суралцагч */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-primary/10 hover:shadow-lg transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Users className="size-5" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium">Нийт суралцагч</p>
            <AnimatedCounter
              value={aggregated.totalStudents}
              className="text-2xl font-bold mt-0.5 block"
            />
          </div>

          {/* Дундаж дуусгалт */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-primary/10 hover:shadow-lg transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium">Дундаж дуусгалт</p>
            <AnimatedCounter
              value={aggregated.avgCompletionRate}
              formatFn={(n) => `${n}%`}
              className="text-2xl font-bold mt-0.5 block"
            />
          </div>

          {/* Нийт орлого — gradient */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white group hover:shadow-lg transition-shadow">
            <div className="relative z-10">
              <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <Banknote className="size-5" />
              </div>
              <p className="text-white/70 text-xs font-medium">Нийт орлого</p>
              <AnimatedCounter
                value={aggregated.totalRevenue}
                formatFn={formatMNT}
                className="text-xl font-bold mt-0.5 block"
              />
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <Banknote className="size-24" />
            </div>
          </div>

          {/* Нийт сертификат */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-primary/10 hover:shadow-lg transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Award className="size-5" />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-medium">Нийт сертификат</p>
            <AnimatedCounter
              value={aggregated.totalCertificates}
              className="text-2xl font-bold mt-0.5 block"
            />
          </div>
        </motion.div>

        {/* Section 3 — Course Cards Grid */}
        <motion.div variants={section}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Сургалтууд</h2>
            <span className="text-sm text-slate-500">{courses.length} сургалт</span>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={cardGrid}
            initial="hidden"
            animate="show"
          >
            {courses.map((course: Course, i: number) => (
              <CourseAnalyticsCard
                key={course.id}
                course={course}
                stats={statsQueries[i]?.data}
                statsLoading={statsQueries[i]?.isLoading ?? true}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
