'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
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

export function HeroBanner({ enrollment }: HeroBannerProps) {
  const t = useTranslations('dashboard');

  if (enrollment) {
    /** Идэвхтэй сургалттай хэрэглэгчийн "Continue Learning" banner */
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary min-h-[200px] md:min-h-[220px] flex items-center shadow-lg">
        {/* Ар талын чимэглэл */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-[40%] w-[200px] h-[200px] bg-violet-500/10 rounded-full blur-2xl translate-y-1/2" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, white 0, white 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, white 0, white 1px, transparent 0, transparent 50%)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-6 p-8 md:p-10">
          {/* Зүүн хэсэг — текст */}
          <div className="flex-1 max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold tracking-widest text-white/60 uppercase">
                {t('heroBannerLabel')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-4 line-clamp-2">
              {enrollment.courseTitle}
            </h2>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white/60">{t('progress')}</span>
                <span className="text-xs font-bold text-white/80">
                  {enrollment.progressPercentage}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-400 to-primary rounded-full transition-all duration-500"
                  style={{ width: `${enrollment.progressPercentage}%` }}
                />
              </div>
            </div>

            <Link
              href={`${ROUTES.COURSES}/${enrollment.courseSlug}`}
              className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors shadow-md"
            >
              {t('continueLearning')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Баруун хэсэг — progress ring */}
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
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  fill="none"
                  stroke="rgba(167,139,250,0.8)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - enrollment.progressPercentage / 100)}`}
                  className="transition-all duration-700"
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 min-h-[200px] md:min-h-[220px] flex items-center shadow-lg">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-violet-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between w-full gap-6 p-8 md:p-10">
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-white/60 uppercase">
              {t('heroBannerLabel')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-6">
            {t('heroBannerTitle')}
          </h2>
          <Link
            href={ROUTES.COURSES}
            className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors shadow-md"
          >
            {t('seeAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="hidden sm:flex shrink-0 items-center justify-center">
          <div className="w-28 h-28 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
            <BookOpen className="w-12 h-12 text-primary/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
