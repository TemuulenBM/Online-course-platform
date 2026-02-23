'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';

/** Түвшингийн badge өнгө */
const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

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

  return (
    <Link href={ROUTES.COURSE_DETAIL(course.slug)}>
      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-emerald-100 dark:from-purple-900/30 dark:to-emerald-900/30 flex items-center justify-center">
              <BookOpen className="size-12 text-slate-400" />
            </div>
          )}
          {/* Category badge overlay */}
          {course.categoryName && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
              {course.categoryName}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Difficulty badge */}
          <div className="mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${difficultyStyles[course.difficulty] || difficultyStyles.beginner}`}
            >
              {t(course.difficulty)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
            {course.instructorName && (
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {course.instructorName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {course.durationMinutes} {t('minutes')}
            </span>
          </div>

          {/* Price */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {isFree ? t('free') : `₮${displayPrice?.toLocaleString()}`}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ₮{course.price?.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
