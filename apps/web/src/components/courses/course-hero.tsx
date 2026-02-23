'use client';

import Image from 'next/image';
import { BookOpen, Clock, Globe, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';

/** Түвшингийн badge өнгө */
const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-purple-100 text-purple-700',
};

interface CourseHeroProps {
  course: Course;
}

/** Сургалтын дэлгэрэнгүй хуудасны hero section */
export function CourseHero({ course }: CourseHeroProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex flex-col gap-5">
      {/* Thumbnail */}
      <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-emerald-100 dark:from-purple-900/30 dark:to-emerald-900/30 flex items-center justify-center">
            <BookOpen className="size-16 text-slate-300" />
          </div>
        )}
        {/* Category badge */}
        {course.categoryName && (
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-primary">
            {course.categoryName}
          </div>
        )}
      </div>

      {/* Title + Meta */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${difficultyStyles[course.difficulty] || difficultyStyles.beginner}`}
          >
            {t(course.difficulty)}
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
          {course.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          {course.instructorName && (
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              {course.instructorName}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {course.durationMinutes} {t('minutes')}
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-4" />
            {course.language}
          </span>
        </div>
      </div>
    </div>
  );
}
