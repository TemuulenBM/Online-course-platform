'use client';

import Image from 'next/image';
import { BookOpen, Maximize, PlayCircle, Star, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';

/** Түвшингийн badge өнгө */
const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-500 text-white',
  intermediate: 'bg-amber-500 text-white',
  advanced: 'bg-purple-500 text-white',
};

/** Duration-г mm:ss формат руу хувиргах */
function formatPreviewTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:00`;
  return `${m}:00`;
}

interface CourseHeroProps {
  course: Course;
}

/** Сургалтын дэлгэрэнгүй hero — video overlay + badge + title + meta */
export function CourseHero({ course }: CourseHeroProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex flex-col">
      {/* Video/Thumbnail хэсэг */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group cursor-pointer">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#8A93E5]/20 via-[#A78BFA]/15 to-emerald-200/20 dark:from-[#8A93E5]/10 dark:via-[#A78BFA]/10 dark:to-emerald-900/10 flex items-center justify-center">
            <BookOpen className="size-16 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play товч — голд */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-white/80 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <PlayCircle className="size-8 text-slate-900" />
          </div>
        </div>

        {/* Зүүн доод — Preview badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg">
          <PlayCircle className="size-3.5" />
          <span>
            {formatPreviewTime(course.durationMinutes)} {t('preview')}
          </span>
        </div>

        {/* Баруун доод — Maximize icon */}
        <div className="absolute bottom-4 right-4 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <Maximize className="size-4" />
        </div>
      </div>

      {/* Badge мөр */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {course.categoryName && (
          <span className="border border-[#8A93E5] text-[#8A93E5] rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {course.categoryName}
          </span>
        )}
        <span className="bg-[#8A93E5] text-white rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider">
          Bestseller
        </span>
        <span
          className={`rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wider ${difficultyStyles[course.difficulty] || difficultyStyles.beginner}`}
        >
          {t(course.difficulty)}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-4">
        {course.title}
      </h1>

      {/* Meta мөр */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-500 dark:text-slate-400">
        {/* Instructor avatar + нэр */}
        {course.instructorName && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8A93E5] to-[#A78BFA] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">
                  {course.instructorName.charAt(0)}
                </span>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {course.instructorName}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">·</span>
          </>
        )}

        {/* Rating — static placeholder */}
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">4.9</span>
          <span className="text-slate-400">(12.5k)</span>
        </div>

        <span className="text-slate-300 dark:text-slate-600">·</span>

        {/* Enrolled count — static placeholder */}
        <div className="flex items-center gap-1.5">
          <Users className="size-4" />
          <span>24,500 {t('enrolled')}</span>
        </div>
      </div>
    </div>
  );
}
