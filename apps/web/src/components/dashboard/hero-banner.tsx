'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants';

interface ContinueLearningEnrollment {
  courseTitle: string;
  courseSlug: string;
  progressPercentage: number;
}

interface HeroBannerProps {
  /** Сүүлийн идэвхтэй элсэлт — байвал "Үргэлжлүүлэх", байхгүй бол "Эхлүүлэх" */
  enrollment?: ContinueLearningEnrollment | null;
}

/** Дараагийн milestone-г тооцоолох (25, 50, 75, 100) */
function getNextMilestone(progress: number): number {
  if (progress < 25) return 25;
  if (progress < 50) return 50;
  if (progress < 75) return 75;
  return 100;
}

export function HeroBanner({ enrollment }: HeroBannerProps) {
  const t = useTranslations('dashboard');

  if (enrollment) {
    const nextMilestone = getNextMilestone(enrollment.progressPercentage);
    const circumference = 2 * Math.PI * 52;

    /** Идэвхтэй сургалттай хэрэглэгчийн "Continue Learning" banner */
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary/80 to-violet-900 min-h-[200px] md:min-h-[220px] flex items-center shadow-lg">
        {/* Ар талын чимэглэл */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-[40%] w-[200px] h-[200px] bg-violet-300/10 rounded-full blur-2xl translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-6 p-8 md:p-10">
          {/* Зүүн хэсэг — текст */}
          <div className="flex-1 max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold tracking-widest text-white/60 uppercase">
                {t('heroBannerLabel')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-4 line-clamp-2">
              {enrollment.courseTitle}
            </h2>

            {/* Progress bar — milestone segment-үүд */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white/60">{t('progress')}</span>
                <span className="text-xs font-bold text-white/80">
                  {enrollment.progressPercentage}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
                {/* Milestone markers */}
                {[25, 50, 75].map((m) => (
                  <div
                    key={m}
                    className="absolute top-0 bottom-0 w-px bg-white/20"
                    style={{ left: `${m}%` }}
                  />
                ))}
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-300 to-white/90 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${enrollment.progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>

            {/* Milestone indicator — retention */}
            <div className="flex items-center gap-1.5 mb-5">
              <Target className="w-3.5 h-3.5 text-violet-300/70" />
              <span className="text-[11px] font-semibold text-white/50">
                {t('nextMilestone', { percent: nextMilestone })}
              </span>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={`${ROUTES.COURSES}/${enrollment.courseSlug}`}
                className="inline-flex items-center gap-2 bg-white/95 backdrop-blur text-primary font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white shadow-lg hover:shadow-xl transition-all"
              >
                {t('continueLearning')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Баруун хэсэг — animated progress ring */}
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
                    strokeDashoffset: circumference * (1 - enrollment.progressPercentage / 100),
                  }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {enrollment.progressPercentage}%
                </span>
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mt-0.5">
                  {t('done')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** Элсэлт байхгүй хэрэглэгчийн "Эхлүүлэх" banner */
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary/70 to-violet-900 min-h-[180px] flex items-center shadow-lg">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-violet-300/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between w-full gap-6 p-8 md:p-10">
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-300" />
            <span className="text-xs font-bold tracking-widest text-white/60 uppercase">
              {t('heroBannerLabel')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-6">
            {t('heroBannerTitle')}
          </h2>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={ROUTES.COURSES}
              className="inline-flex items-center gap-2 bg-white/95 backdrop-blur text-primary font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white shadow-lg hover:shadow-xl transition-all"
            >
              {t('seeAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="hidden sm:flex shrink-0 items-center justify-center">
          <div className="w-28 h-28 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
            <BookOpen className="w-12 h-12 text-white/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
