'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, ShoppingCart, PlayCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';

/** Түвшингийн badge стиль */
const difficultyStyles: Record<string, string> = {
  beginner: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10',
  intermediate: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10',
  advanced: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10',
};

/** Ангиллын badge bg өнгө */
const categoryBgStyles: Record<string, string> = {
  design: 'bg-primary',
  development: 'bg-blue-500',
  marketing: 'bg-orange-500',
  business: 'bg-amber-500',
  photography: 'bg-pink-500',
  music: 'bg-red-500',
  lifestyle: 'bg-teal-500',
};

interface CourseCardProps {
  course: Course;
}

/** Нэг сургалтын карт — шинэ дизайн */
export function CourseCard({ course }: CourseCardProps) {
  const t = useTranslations('courses');

  const displayPrice = course.discountPrice ?? course.price;
  const isFree = !displayPrice || displayPrice === 0;
  const hasDiscount =
    course.discountPrice != null && course.price != null && course.discountPrice < course.price;

  const categorySlug = course.categoryName?.toLowerCase() || '';
  const catBg = categoryBgStyles[categorySlug] || 'bg-primary';

  // Hover preview-д ашиглах duration тооцоол
  const videoHours = Math.floor(course.durationMinutes / 60);
  const videoMins = course.durationMinutes % 60;
  const durationLabel = videoHours > 0 ? `${videoHours}ц ${videoMins}мин` : `${videoMins}мин`;

  return (
    <Link href={ROUTES.COURSE_DETAIL(course.slug)}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative h-48 w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <BookOpen className="size-12 text-slate-300 dark:text-slate-600" />
            </div>
          )}
          {course.categoryName && (
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 ${catBg} text-white text-[10px] font-bold rounded-full uppercase tracking-wider`}
              >
                {course.categoryName}
              </span>
            </div>
          )}

          {/* Hover preview overlay — thumbnail дээр гарч ирэх */}
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 p-5 flex flex-col gap-3 pointer-events-none">
            <p className="text-white text-xs leading-relaxed line-clamp-5">{course.description}</p>
            <div className="flex items-center gap-2 text-white/60 text-[10px]">
              <Clock className="size-3 shrink-0" />
              <span>{durationLabel}</span>
            </div>
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-white/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3 flex-1">
          {/* Түвшин */}
          <div className="flex items-center">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${difficultyStyles[course.difficulty] || difficultyStyles.beginner}`}
            >
              {t(course.difficulty)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-white">
                {course.instructorName?.charAt(0) || '?'}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {course.instructorName || t('instructor')}
            </span>
          </div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {course.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Price + action */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-slate-400 text-[10px] line-through">
                  {course.price?.toLocaleString()}₮
                </span>
              )}
              <span className="text-primary font-bold text-lg">
                {isFree ? t('free') : `${displayPrice?.toLocaleString()}₮`}
              </span>
            </div>
            <button
              type="button"
              className="p-2.5 min-w-[44px] min-h-[44px] bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center"
              onClick={(e) => e.preventDefault()}
            >
              {isFree ? <PlayCircle className="size-5" /> : <ShoppingCart className="size-5" />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
