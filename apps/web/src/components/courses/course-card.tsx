'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';

/** Түвшингийн badge өнгө — thumbnail дээр overlay */
const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-500 text-white',
  intermediate: 'bg-amber-500 text-white',
  advanced: 'bg-purple-500 text-white',
};

/** Ангиллын badge стиль — categoryName-аар */
const categoryStyles: Record<string, string> = {
  design: 'border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300',
  development: 'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300',
  marketing: 'border-emerald-300 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300',
  business: 'border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300',
  photography: 'border-pink-300 text-pink-700 dark:border-pink-600 dark:text-pink-300',
  music: 'border-red-300 text-red-700 dark:border-red-600 dark:text-red-300',
  lifestyle: 'border-teal-300 text-teal-700 dark:border-teal-600 dark:text-teal-300',
};

/** Duration-г Xh Ym формат руу хувиргах */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

interface CourseCardProps {
  course: Course;
}

/** Нэг сургалтын карт — Stitch дизайнд тулгуурласан */
export function CourseCard({ course }: CourseCardProps) {
  const t = useTranslations('courses');

  const displayPrice = course.discountPrice ?? course.price;
  const isFree = !displayPrice || displayPrice === 0;
  const hasDiscount =
    course.discountPrice != null && course.price != null && course.discountPrice < course.price;

  /** Ангиллын slug-аар badge стиль сонгох */
  const categorySlug = course.categoryName?.toLowerCase() || '';
  const catStyle =
    categoryStyles[categorySlug] ||
    'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300';

  return (
    <Link href={ROUTES.COURSE_DETAIL(course.slug)}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#8A93E5]/20 via-[#A78BFA]/15 to-emerald-200/20 dark:from-[#8A93E5]/10 dark:via-[#A78BFA]/10 dark:to-emerald-900/10 flex items-center justify-center">
              <BookOpen className="size-14 text-slate-300 dark:text-slate-600" />
            </div>
          )}

          {/* Badge-ууд — зүүн дээд булан */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {course.categoryName && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm ${catStyle}`}
              >
                {course.categoryName}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${difficultyStyles[course.difficulty] || difficultyStyles.beginner}`}
            >
              {t(course.difficulty)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[#8A93E5] transition-colors line-clamp-1">
            {course.title}
          </h3>

          {/* Meta — instructor avatar + нэр + duration */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            {/* Instructor avatar placeholder */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8A93E5] to-[#A78BFA] flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-white">
                {course.instructorName?.charAt(0) || '?'}
              </span>
            </div>
            {course.instructorName && (
              <>
                <span className="text-xs truncate">By {course.instructorName}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
              </>
            )}
            <span className="flex items-center gap-1 text-xs shrink-0">
              <Clock className="size-3" />
              {formatDuration(course.durationMinutes)}
            </span>
          </div>

          {/* Price + Arrow товч */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {isFree ? t('free') : `₮${displayPrice?.toLocaleString()}`}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ₮{course.price?.toLocaleString()}
                </span>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8A93E5] to-[#A78BFA] flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#8A93E5]/25 transition-all">
              <ArrowRight className="size-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
